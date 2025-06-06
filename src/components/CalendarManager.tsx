
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Calendar as CalendarIcon, Clock, Trash2, Bell, Gift, Users, MapPin } from "lucide-react";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";

export const CalendarManager = () => {
  const { 
    events, 
    addEvent, 
    deleteEvent, 
    getEventsForDate,
    getUpcomingEvents,
    startEventSystem 
  } = useCalendarEvents();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Safe date formatting function
  const safeFormat = (date: Date | string, formatStr: string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, formatStr);
  };
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: safeFormat(new Date(), 'yyyy-MM-dd'),
    time: '',
    type: 'other' as CalendarEvent['type'],
    notifyBefore: 15,
    isRecurring: false,
    recurringType: 'weekly' as CalendarEvent['recurringType']
  });

  useEffect(() => {
    const cleanup = startEventSystem();
    return cleanup;
  }, []);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    
    addEvent({
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      type: newEvent.type,
      notifyBefore: newEvent.notifyBefore,
      isRecurring: newEvent.isRecurring,
      recurringType: newEvent.recurringType
    });

    setNewEvent({ 
      title: '', 
      description: '', 
      date: safeFormat(new Date(), 'yyyy-MM-dd'), 
      time: '', 
      type: 'other',
      notifyBefore: 15,
      isRecurring: false,
      recurringType: 'weekly'
    });
    setShowAddForm(false);
  };

  const typeColors = {
    birthday: 'bg-pink-100 text-pink-700 border-pink-200',
    meeting: 'bg-blue-100 text-blue-700 border-blue-200',
    appointment: 'bg-green-100 text-green-700 border-green-200',
    reminder: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    other: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const typeIcons = {
    birthday: Gift,
    meeting: Users,
    appointment: MapPin,
    reminder: Bell,
    other: CalendarIcon
  };

  const typeLabels = {
    birthday: 'Aniversário',
    meeting: 'Reunião',
    appointment: 'Compromisso',
    reminder: 'Lembrete',
    other: 'Outro'
  };

  const selectedDateEvents = getEventsForDate(safeFormat(selectedDate, 'yyyy-MM-dd'));
  const upcomingEvents = getUpcomingEvents(7);

  // Filter out events with invalid dates before creating Date objects
  const eventDates = events
    .filter(event => event.date && isValid(new Date(event.date)))
    .map(event => new Date(event.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário de Eventos
            </CardTitle>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-blue-100 pt-4">
            <div className="space-y-4">
              <Input
                placeholder="Título do evento"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
                <Select 
                  value={newEvent.type} 
                  onValueChange={(value: CalendarEvent['type']) => setNewEvent({...newEvent, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo do evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Aniversário</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="appointment">Compromisso</SelectItem>
                    <SelectItem value="reminder">Lembrete</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notificar antes (minutos)</label>
                  <Input
                    type="number"
                    value={newEvent.notifyBefore}
                    onChange={(e) => setNewEvent({...newEvent, notifyBefore: parseInt(e.target.value) || 15})}
                    min="1"
                    max="1440"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newEvent.isRecurring}
                      onCheckedChange={(checked) => setNewEvent({...newEvent, isRecurring: checked})}
                    />
                    <label className="text-sm font-medium">Evento recorrente</label>
                  </div>
                  {newEvent.isRecurring && (
                    <Select 
                      value={newEvent.recurringType} 
                      onValueChange={(value: CalendarEvent['recurringType']) => setNewEvent({...newEvent, recurringType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEvent} className="bg-green-600 hover:bg-green-700">
                  Criar Evento
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasEvent: eventDates
              }}
              modifiersStyles={{
                hasEvent: { 
                  backgroundColor: '#3b82f6', 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Eventos do dia selecionado */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">
              Eventos - {safeFormat(selectedDate, 'dd/MM/yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhum evento nesta data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((event) => {
                    const IconComponent = typeIcons[event.type];
                    return (
                      <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.time}
                            </Badge>
                            <Badge variant="outline" className={typeColors[event.type]}>
                              <IconComponent className="h-3 w-3 mr-1" />
                              {typeLabels[event.type]}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-gray-800">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-gray-600">{event.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos eventos */}
      <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Próximos Eventos (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum evento próximo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const IconComponent = typeIcons[event.type];
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                          {safeFormat(new Date(event.date), 'dd/MM')}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time}
                        </Badge>
                        <Badge variant="outline" className={typeColors[event.type]}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {typeLabels[event.type]}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-800">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-600">{event.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
