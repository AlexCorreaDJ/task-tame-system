import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Reminder } from '@/types/reminder';
import {
  requestLocalNotificationPermission,
  testBalloonNotification,
  scheduleReminderForToday,
  isNativePlatform,
  cancelLocalNotification,
  initializeLocalNotifications,
  startReminderChecker,
  stopReminderChecker,
  getScheduledLocalNotifications
} from '@/utils/localNotifications';
import { scheduleReminder, rescheduleReminder, cancelReminder } from '@/utils/reminderScheduler';
import { toast } from '@/hooks/use-toast';

export const useReminders = () => {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('reminders', []);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para pedir permissão
  const requestNotificationPermission = async () => {
    try {
      console.log('🔔 Solicitando permissão de notificações...');
      const granted = await requestLocalNotificationPermission();
      setPermissionGranted(granted);
      
      if (!granted) {
        setError('Permissão para notificações negada');
        toast({
          title: "⚠️ Permissão necessária",
          description: "Para receber lembretes, ative as notificações nas configurações do Android",
          variant: "destructive"
        });
      } else {
        setError(null);
        toast({
          title: "✅ Notificações ativadas!",
          description: "Agora você receberá lembretes no horário configurado! 🔔",
        });
      }
      return granted;
    } catch (e) {
      console.error('❌ Erro ao solicitar permissão:', e);
      setError('Erro ao solicitar permissão');
      return false;
    }
  };

  // Testa a notificação "balão"
  const testBalloonNotificationHandler = async () => {
    try {
      console.log('🧪 Testando notificação...');
      const success = await testBalloonNotification();
      
      if (success) {
        toast({
          title: "🧪 Teste enviado!",
          description: "Verifique se a notificação apareceu na barra do Android",
        });
      } else {
        toast({
          title: "❌ Erro no teste",
          description: "Não foi possível enviar a notificação de teste",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error('❌ Erro ao testar notificação:', e);
      setError('Erro ao testar notificação');
      toast({
        title: "❌ Erro no teste",
        description: "Verifique se as permissões estão ativadas",
        variant: "destructive"
      });
    }
  };

  // Adicionar lembrete
  const addReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    console.log('➕ Adicionando novo lembrete:', reminderData);
    
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const scheduledReminder = await scheduleReminder(newReminder);
      setReminders(prev => [...prev, scheduledReminder]);
      setError(null);
      
      console.log('✅ Lembrete adicionado com sucesso:', scheduledReminder);
    } catch (e) {
      console.error('❌ Erro ao adicionar lembrete:', e);
      setError('Erro ao adicionar lembrete');
      toast({
        title: "❌ Erro",
        description: "Não foi possível criar o lembrete",
        variant: "destructive"
      });
    }
  };

  // Deletar lembrete
  const deleteReminder = async (id: string) => {
    console.log(`🗑️ Deletando lembrete ${id}`);
    
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      try {
        await cancelReminder(reminder);
        setReminders(prev => prev.filter(r => r.id !== id));
        setError(null);
        
        toast({
          title: "🗑️ Lembrete removido",
          description: `"${reminder.title}" foi removido com sucesso`,
        });
        
        console.log('✅ Lembrete deletado com sucesso');
      } catch (e) {
        console.error('❌ Erro ao deletar lembrete:', e);
        setError('Erro ao deletar lembrete');
      }
    }
  };

  // Toggle ativo/inativo
  const toggleReminder = async (id: string) => {
    console.log(`🔄 Alternando status do lembrete ${id}`);
    
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      try {
        const updates = { isActive: !reminder.isActive };
        await rescheduleReminder(reminder, updates);
        
        setReminders(prev => 
          prev.map(r => 
            r.id === id ? { ...r, ...updates } : r
          )
        );
        setError(null);
        
        const status = updates.isActive ? 'ativado' : 'desativado';
        toast({
          title: `🔄 Lembrete ${status}`,
          description: `"${reminder.title}" foi ${status}`,
        });
        
        console.log(`✅ Lembrete ${status} com sucesso`);
      } catch (e) {
        console.error('❌ Erro ao atualizar lembrete:', e);
        setError('Erro ao atualizar lembrete');
      }
    }
  };

  // Toggle estilo balão (apenas para apps nativos)
  const toggleBalloonStyle = async (id: string) => {
    if (!isNativePlatform()) return;
    
    console.log(`🎈 Alternando estilo balão do lembrete ${id}`);
    
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      try {
        const updates = { useBalloonStyle: !reminder.useBalloonStyle };
        await rescheduleReminder(reminder, updates);
        
        setReminders(prev => 
          prev.map(r => 
            r.id === id ? { ...r, ...updates } : r
          )
        );
        setError(null);
        
        const style = updates.useBalloonStyle ? 'ativado' : 'desativado';
        toast({
          title: `🎈 Estilo balão ${style}`,
          description: `Estilo balão ${style} para "${reminder.title}"`,
        });
        
        console.log(`✅ Estilo balão ${style} com sucesso`);
      } catch (e) {
        console.error('❌ Erro ao atualizar estilo do lembrete:', e);
        setError('Erro ao atualizar estilo do lembrete');
      }
    }
  };

  // Inicializar sistema de lembretes
  const startReminderSystem = async () => {
    try {
      console.log('🚀 Inicializando sistema de lembretes...');
      
      // Inicializa notificações locais se for app nativo
      if (isNativePlatform()) {
        const initialized = await initializeLocalNotifications();
        setPermissionGranted(initialized);
        
        if (initialized) {
          // Inicia o verificador de lembretes
          startReminderChecker();
          
          // Reagenda todos os lembretes ativos
          console.log('🔄 Reagendando lembretes ativos...');
          for (const reminder of reminders.filter(r => r.isActive)) {
            await scheduleReminder(reminder);
          }
          
          // Mostra status das notificações agendadas
          const scheduled = await getScheduledLocalNotifications();
          console.log(`📋 ${scheduled.length} notificações agendadas no sistema`);
          
          toast({
            title: "🚀 Sistema ativo!",
            description: `${reminders.filter(r => r.isActive).length} lembretes ativos, ${scheduled.length} notificações agendadas`,
          });
        }
      } else {
        // Para web, apenas solicita permissão
        await requestNotificationPermission();
      }
      
      setError(null);
      
      // Retorna função de cleanup
      return () => {
        console.log('🛑 Parando sistema de lembretes...');
        stopReminderChecker();
      };
    } catch (e) {
      console.error('❌ Erro ao inicializar sistema de lembretes:', e);
      setError('Erro ao inicializar sistema de lembretes');
      return () => {};
    }
  };

  // Inicializa permissões ao carregar o hook
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return {
    reminders,
    permissionGranted,
    error,
    addReminder,
    deleteReminder,
    toggleReminder,
    toggleBalloonStyle,
    testBalloonNotification: testBalloonNotificationHandler,
    requestNotificationPermission,
    startReminderSystem,
  };
};