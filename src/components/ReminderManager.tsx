
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Bell, BellPlus, Clock, Trash2 } from "lucide-react";
import { useReminders, Reminder } from "@/hooks/useReminders";

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
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    time: '',
    type: 'custom' as Reminder['type']
  });

  useEffect(() => {
    // Inicia o sistema de lembretes
    const cleanup = startReminderSystem();
    
    // Verifica permissão de notificação
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission === 'granted');
    }

    return cleanup;
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted);
  };

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.time) return;
    
    addReminder({
      title: newReminder.title,
      description: newReminder.description,
      time: newReminder.time,
      type: newReminder.type,
      isActive: true
    });

    setNewReminder({ title: '', description: '', time: '', type: 'custom' });
    setShowAddForm(false);
  };

  const typeColors = {
    task: 'bg-blue-100 text-blue-700 border-blue-200',
    reading: 'bg-green-100 text-green-700 border-green-200',
    project: 'bg-purple-100 text-purple-700 border-purple-200',
    break: 'bg-orange-100 text-orange-700 border-orange-200',
    custom: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const typeLabels = {
    task: 'Tarefa',
    reading: 'Leitura',
    project: 'Projeto',
    break: 'Pausa',
    custom: 'Personalizado'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Lembretes e Notificações
            </CardTitle>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Lembrete
            </Button>
          </div>
          
          {/* Permissão de notificação */}
          {!notificationPermission && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-yellow-700 mb-2">
                Permita notificações para receber lembretes no horário certo!
              </p>
              <Button 
                onClick={handleRequestPermission}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <BellPlus className="h-4 w-4 mr-2" />
                Permitir Notificações
              </Button>
            </div>
          )}
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-blue-100 pt-4">
            <div className="space-y-4">
              <Input
                placeholder="Título do lembrete"
                value={newReminder.title}
                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newReminder.description}
                onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                />
                <Select 
                  value={newReminder.type} 
                  onValueChange={(value: Reminder['type']) => setNewReminder({...newReminder, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo do lembrete" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Personalizado</SelectItem>
                    <SelectItem value="task">Tarefa</SelectItem>
                    <SelectItem value="reading">Leitura</SelectItem>
                    <SelectItem value="project">Projeto</SelectItem>
                    <SelectItem value="break">Pausa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddReminder} className="bg-green-600 hover:bg-green-700">
                  Criar Lembrete
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de lembretes */}
      <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Meus Lembretes ({reminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum lembrete configurado!</p>
              <p className="text-sm text-gray-400 mt-2">
                Crie lembretes para não esquecer das suas atividades importantes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((reminder) => (
                <div 
                  key={reminder.id} 
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    reminder.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <Switch
                    checked={reminder.isActive}
                    onCheckedChange={() => toggleReminder(reminder.id)}
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {reminder.time}
                      </Badge>
                      <Badge variant="outline" className={typeColors[reminder.type]}>
                        {typeLabels[reminder.type]}
                      </Badge>
                      <h3 className="font-medium text-gray-800">{reminder.title}</h3>
                    </div>
                    
                    {reminder.description && (
                      <p className="text-sm text-gray-600">{reminder.description}</p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
