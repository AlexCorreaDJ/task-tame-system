
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Clock } from "lucide-react";
import { useReminders } from "@/hooks/useReminders";
import { toast } from "@/hooks/use-toast";
import { NotificationPermissionBanner } from "./reminders/NotificationPermissionBanner";
import { ReminderForm } from "./reminders/ReminderForm";
import { ReminderList } from "./reminders/ReminderList";

export const ReminderManager = () => {
  const { 
    reminders, 
    addReminder, 
    deleteReminder, 
    toggleReminder, 
    requestNotificationPermission,
    startReminderSystem 
  } = useReminders();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    console.log('🚀 ReminderManager: Iniciando sistema estilo Duolingo...');
    
    // Inicia o sistema de lembretes
    const cleanup = startReminderSystem();
    
    // Verifica permissão de notificação
    if ('Notification' in window) {
      const hasPermission = Notification.permission === 'granted';
      setNotificationPermission(hasPermission);
      console.log('🔔 Permissão de notificação:', Notification.permission);
    }

    return cleanup;
  }, []);

  const handleRequestPermission = async () => {
    console.log('🔔 Solicitando permissão estilo Duolingo...');
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted);
    
    if (granted) {
      toast({
        title: "🎉 Notificações ativadas!",
        description: "Agora você receberá lembretes motivacionais como o Duolingo! 🚀",
      });
    } else {
      toast({
        title: "❌ Permissão negada",
        description: "Vá nas configurações do Android para permitir notificações.",
        variant: "destructive"
      });
    }
  };

  const handleAddReminder = (reminderData: Parameters<typeof addReminder>[0]) => {
    addReminder(reminderData);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header estilo Duolingo */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-green-700 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-bold">Lembretes Motivacionais</h2>
                <p className="text-sm text-green-600 font-normal">Mantenha seu foco como no Duolingo! 🎯</p>
              </div>
            </CardTitle>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700 shadow-lg transform hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Lembrete
            </Button>
          </div>
          
          {/* Status da permissão estilo Duolingo */}
          <div className="mt-4">
            <NotificationPermissionBanner 
              hasPermission={notificationPermission}
              onRequestPermission={handleRequestPermission}
            />
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-green-200 pt-4 bg-white/50">
            <ReminderForm 
              onAddReminder={handleAddReminder}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        )}
      </Card>

      {/* Lista de lembretes estilo Duolingo */}
      <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span>Meus Lembretes ({reminders.length})</span>
              <p className="text-sm text-gray-500 font-normal mt-1">
                Mantenha sua sequência de foco! 🔥
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderList 
            reminders={reminders}
            notificationPermission={notificationPermission}
            onToggleReminder={toggleReminder}
            onDeleteReminder={deleteReminder}
            onShowAddForm={() => setShowAddForm(true)}
          />
        </CardContent>
      </Card>
    </div>
  );
};
