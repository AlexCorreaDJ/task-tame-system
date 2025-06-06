
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Clock, MessageCircle } from "lucide-react";
import { useReminders } from "@/hooks/useReminders";
import { toast } from "@/hooks/use-toast";
import { ReminderForm } from "./reminders/ReminderForm";
import { ReminderList } from "./reminders/ReminderList";
import { initializeAudio } from "@/utils/audioNotifications";
import { isNativeAndroid } from "@/utils/firebaseNotifications";

export const ReminderManager = () => {
  const { 
    reminders, 
    addReminder, 
    deleteReminder, 
    toggleReminder,
    toggleBalloonStyle,
    testBalloonNotification, 
    requestNotificationPermission,
    startReminderSystem 
  } = useReminders();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isNativeApp] = useState(isNativeAndroid());

  // Função para inicializar o áudio quando o usuário interagir
  const handleUserInteraction = () => {
    // Inicializa o sistema de áudio (precisa de interação do usuário)
    initializeAudio();
  };

  useEffect(() => {
    console.log('🚀 ReminderManager: Iniciando sistema de lembretes motivacionais...');
    
    let cleanup: (() => void) | undefined;
    
    // Inicia o sistema de lembretes de forma assíncrona
    const initSystem = async () => {
      cleanup = await startReminderSystem();
    };
    
    initSystem();

    // Adiciona listener para inicializar áudio quando o usuário interagir
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      if (cleanup) {
        cleanup();
      }
      // Remove os event listeners quando o componente for desmontado
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const handleAddReminder = (reminderData: Parameters<typeof addReminder>[0]) => {
    addReminder(reminderData);
    setShowAddForm(false);
    
    toast({
      title: "✅ Lembrete criado!",
      description: `Lembrete "${reminderData.title}" configurado para ${reminderData.time}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header motivacional */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-green-700 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                {isNativeApp ? (
                  <MessageCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Bell className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <h2 className="font-bold">Lembretes Motivacionais</h2>
                <p className="text-sm text-green-600 font-normal">
                  {isNativeApp ? 
                    'Notificações locais em balão automático! 📱💬' : 
                    'Mantenha seu foco e produtividade! 🎯'}
                </p>
              </div>
            </CardTitle>
            <Button 
              onClick={() => {
                setShowAddForm(!showAddForm);
                // Tenta inicializar o áudio quando o usuário clica no botão
                initializeAudio();
              }}
              className="bg-green-600 hover:bg-green-700 shadow-lg transform hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Lembrete
            </Button>
          </div>
          
          {/* Banner informativo para app nativo */}
          {isNativeApp && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-start">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium mb-1">
                    🎉 Notificações Locais Ativadas!
                  </p>
                  <p className="text-blue-700">
                    Seus lembretes aparecerão automaticamente como balões de notificação do Android, 
                    mesmo com o app fechado! Não precisa de internet. 📱✨
                  </p>
                </div>
              </div>
            </div>
          )}
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

      {/* Lista de lembretes */}
      <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span>Meus Lembretes ({reminders.length})</span>
              <p className="text-sm text-gray-500 font-normal mt-1">
                {isNativeApp ? 
                  'Agendados como notificações locais! 📱🔔' : 
                  'Mantenha sua sequência de foco! 🔥'}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderList 
            reminders={reminders}
            notificationPermission={true}
            onToggleReminder={toggleReminder}
            onToggleBalloonStyle={isNativeApp ? toggleBalloonStyle : undefined}
            onDeleteReminder={deleteReminder}
            onShowAddForm={() => setShowAddForm(true)}
            onTestBalloon={isNativeApp ? testBalloonNotification : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
};
