
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Bell, BellPlus, Clock, Trash2, Zap, Target, BookOpen } from "lucide-react";
import { useReminders, Reminder } from "@/hooks/useReminders";
import { toast } from "@/hooks/use-toast";

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

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.time) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Preencha o título e horário do lembrete.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('➕ Criando lembrete estilo Duolingo:', newReminder);
    
    addReminder({
      title: newReminder.title,
      description: newReminder.description,
      time: newReminder.time,
      type: newReminder.type,
      isActive: true
    });

    setNewReminder({ title: '', description: '', time: '', type: 'custom' });
    setShowAddForm(false);
    
    toast({
      title: "🎯 Lembrete criado!",
      description: `Você receberá uma notificação motivacional às ${newReminder.time}! ⏰`,
    });
  };

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
            {notificationPermission ? (
              <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-200 rounded-full">
                    <Bell className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold">🎉 Notificações Ativadas!</p>
                    <p className="text-sm text-green-700">
                      Você receberá lembretes com som, vibração e motivação! 📳🔔
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-200 rounded-full">
                      <BellPlus className="h-5 w-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-yellow-800 font-semibold">⚠️ Ative as Notificações!</p>
                      <p className="text-sm text-yellow-700">
                        Receba lembretes motivacionais com som e vibração como no Duolingo! 🚀
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleRequestPermission}
                    className="bg-yellow-600 hover:bg-yellow-700 shadow-lg transform hover:scale-105 transition-all"
                  >
                    <BellPlus className="h-4 w-4 mr-2" />
                    Ativar Agora!
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-green-200 pt-4 bg-white/50">
            <div className="space-y-4">
              <Input
                placeholder="Ex: Hora de focar nas tarefas! 🎯"
                value={newReminder.title}
                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                className="border-green-200 focus:border-green-400"
              />
              <Textarea
                placeholder="Adicione uma mensagem motivacional... ✨"
                value={newReminder.description}
                onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                rows={2}
                className="border-green-200 focus:border-green-400"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário
                  </label>
                  <Input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Categoria
                  </label>
                  <Select 
                    value={newReminder.type} 
                    onValueChange={(value: Reminder['type']) => setNewReminder({...newReminder, type: value})}
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-400">
                      <SelectValue placeholder="Tipo do lembrete" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">✨ Personalizado</SelectItem>
                      <SelectItem value="task">📋 Tarefa</SelectItem>
                      <SelectItem value="reading">📚 Leitura</SelectItem>
                      <SelectItem value="project">🎯 Projeto</SelectItem>
                      <SelectItem value="break">☕ Pausa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleAddReminder} 
                  className="bg-green-600 hover:bg-green-700 shadow-lg transform hover:scale-105 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Lembrete
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </div>
            </div>
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
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum lembrete ainda!</h3>
              <p className="text-gray-500 mb-4">
                Crie lembretes motivacionais para manter seu foco em dia! 🎯
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Lembrete
              </Button>
            </div>
          ) : (
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
                        onCheckedChange={() => toggleReminder(reminder.id)}
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
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transform hover:scale-110 transition-all"
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
