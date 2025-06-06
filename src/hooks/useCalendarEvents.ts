
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/use-toast';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  type: 'birthday' | 'meeting' | 'appointment' | 'reminder' | 'other';
  notifyBefore: number; // minutes before event
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('focusflow-calendar-events', []);

  // Função para mostrar notificação
  const showEventNotification = (event: CalendarEvent) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(event.title, {
        body: `${event.description || 'Evento em breve!'}\n${event.time}`,
        icon: '/favicon.ico',
        tag: event.id
      });
    }
    
    toast({
      title: event.title,
      description: `${event.description || 'Evento em breve!'} às ${event.time}`,
    });
  };

  // Função para verificar eventos próximos
  const checkUpcomingEvents = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    events.forEach(event => {
      if (event.date === currentDate) {
        const eventTime = new Date(`${event.date}T${event.time}`);
        const notifyTime = new Date(eventTime.getTime() - (event.notifyBefore * 60000));
        
        if (now >= notifyTime && now < eventTime) {
          showEventNotification(event);
        }
      }
    });
  };

  // Inicia o sistema de verificação de eventos
  const startEventSystem = () => {
    const interval = setInterval(checkUpcomingEvents, 60000);
    return () => clearInterval(interval);
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const getUpcomingEvents = (days: number = 7) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= futureDate;
    }).sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getUpcomingEvents,
    startEventSystem
  };
};
