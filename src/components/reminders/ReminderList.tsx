
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Reminder } from "@/types/reminder";
import { Clock, Trash2, Bell, BookOpen, Briefcase, Coffee, Activity, MessageCircle } from "lucide-react";
import { isNativeAndroid } from "@/utils/firebaseNotifications";

interface ReminderListProps {
  reminders: Reminder[];
  notificationPermission: boolean;
  onToggleReminder: (id: string) => void;
  onToggleBalloonStyle?: (id: string) => void; // Nova prop para controlar estilo de balão
  onDeleteReminder: (id: string) => void;
  onShowAddForm: () => void;
  onTestBalloon?: () => void; // Nova prop para testar notificações em balão
}

export const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  notificationPermission,
  onToggleReminder,
  onToggleBalloonStyle,
  onDeleteReminder,
  onShowAddForm,
  onTestBalloon
}) => {
  // Obtém o tipo de ícone baseado no tipo do lembrete
  const getIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'reading': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'project': return <Briefcase className="h-4 w-4 text-purple-600" />;
      case 'break': return <Coffee className="h-4 w-4 text-green-600" />;
      case 'custom': return <Activity className="h-4 w-4 text-yellow-600" />;
      default: return <Bell className="h-4 w-4 text-red-600" />;
    }
  };

  // Obtém rótulo baseado no tipo do lembrete
  const getLabel = (type: Reminder['type']) => {
    switch (type) {
      case 'reading': return 'Leitura';
      case 'project': return 'Projeto';
      case 'break': return 'Pausa';
      case 'custom': return 'Personalizado';
      default: return 'Tarefa';
    }
  };

  // Verifica se a funcionalidade de balão está disponível
  const balloonStyleAvailable = isNativeAndroid() && !!onToggleBalloonStyle;

  if (reminders.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Bell className="h-7 w-7 text-blue-500" />
        </div>
        <h3 className="text-gray-700 font-medium mb-2">Nenhum lembrete ainda</h3>
        <p className="text-gray-500 mb-4 text-sm">
          Crie lembretes para ajudar a manter seu foco nas atividades importantes.
        </p>
        <Button onClick={onShowAddForm} className="bg-green-600 hover:bg-green-700">
          Criar Primeiro Lembrete
        </Button>
        
        {balloonStyleAvailable && onTestBalloon && (
          <div className="mt-4">
            <Button 
              onClick={onTestBalloon}
              variant="outline"
              className="border-blue-200 text-blue-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Testar Notificação em Balão
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {balloonStyleAvailable && onTestBalloon && (
        <div className="flex justify-end mb-2">
          <Button 
            onClick={onTestBalloon}
            size="sm"
            variant="outline"
            className="border-blue-200 text-blue-700"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Testar Balão
          </Button>
        </div>
      )}

      {reminders.map((reminder) => (
        <div 
          key={reminder.id} 
          className={`border rounded-lg p-3 transition-colors ${
            reminder.isActive 
              ? 'bg-white border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${reminder.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                <Clock className="h-3 w-3 mr-1" />
                {reminder.time}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {getIcon(reminder.type)}
                <span className="ml-1">{getLabel(reminder.type)}</span>
              </Badge>
              
              {balloonStyleAvailable && reminder.useBalloonStyle && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Balão
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={reminder.isActive} 
                onCheckedChange={() => onToggleReminder(reminder.id)}
                aria-label="Ativar lembrete"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteReminder(reminder.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <h3 className={`font-medium ${reminder.isActive ? 'text-gray-800' : 'text-gray-500'}`}>
            {reminder.title}
          </h3>
          
          {reminder.description && (
            <p className={`text-sm mt-1 ${reminder.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
              {reminder.description}
            </p>
          )}

          {balloonStyleAvailable && onToggleBalloonStyle && (
            <div className="mt-2 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleBalloonStyle(reminder.id)}
                className={`text-xs flex items-center space-x-1 ${
                  reminder.useBalloonStyle 
                    ? 'text-purple-600 hover:text-purple-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageCircle className="h-3 w-3" />
                <span>{reminder.useBalloonStyle ? 'Desativar balão' : 'Ativar balão'}</span>
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
