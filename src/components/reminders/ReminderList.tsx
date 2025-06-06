
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Bell, Clock, Trash2, Zap, Target, BookOpen } from "lucide-react";
import { Reminder } from "@/hooks/useReminders";

interface ReminderListProps {
  reminders: Reminder[];
  notificationPermission: boolean;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onShowAddForm: () => void;
}

export const ReminderList = ({
  reminders,
  notificationPermission,
  onToggleReminder,
  onDeleteReminder,
  onShowAddForm
}: ReminderListProps) => {
  const typeColors = {
    task: 'bg-blue-100 text-blue-700 border-blue-200',
    reading: 'bg-green-100 text-green-700 border-green-200',
    project: 'bg-purple-100 text-purple-700 border-purple-200',
    break: 'bg-orange-100 text-orange-700 border-orange-200',
    custom: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const typeLabels = {
    task: '📋 Tarefa',
    reading: '📚 Leitura',
    project: '🎯 Projeto',
    break: '☕ Pausa',
    custom: '✨ Personalizado'
  };

  const typeIcons = {
    task: Target,
    reading: BookOpen,
    project: Zap,
    break: Clock,
    custom: Bell
  };

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Bell className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum lembrete ainda!</h3>
        <p className="text-gray-500 mb-4">
          Crie lembretes motivacionais para manter seu foco em dia! 🎯
        </p>
        <Button 
          onClick={onShowAddForm}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Primeiro Lembrete
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders
        .sort((a, b) => a.time.localeCompare(b.time))
        .map((reminder) => {
          const IconComponent = typeIcons[reminder.type];
          return (
            <div 
              key={reminder.id} 
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                reminder.isActive 
                  ? 'bg-white shadow-md border-green-200 hover:shadow-lg' 
                  : 'bg-gray-50 opacity-60 border-gray-200'
              }`}
            >
              <Switch
                checked={reminder.isActive}
                onCheckedChange={() => onToggleReminder(reminder.id)}
                className="data-[state=checked]:bg-green-600"
              />
              
              <div className="p-2 bg-blue-100 rounded-full">
                <IconComponent className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {reminder.time}
                  </Badge>
                  <Badge variant="outline" className={typeColors[reminder.type]}>
                    {typeLabels[reminder.type]}
                  </Badge>
                  {reminder.isActive && notificationPermission && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      <Bell className="h-3 w-3 mr-1" />
                      Com Som & Vibração
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
                
                {reminder.description && (
                  <p className="text-sm text-gray-600">{reminder.description}</p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteReminder(reminder.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 transform hover:scale-110 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
    </div>
  );
};
