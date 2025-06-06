
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Clock, Target, AlarmClock } from "lucide-react";
import { Reminder } from "@/hooks/useReminders";
import { toast } from "@/hooks/use-toast";
import { createSystemAlarm, isAlarmSupported } from "@/utils/alarmIntegration";

interface ReminderFormProps {
  onAddReminder: (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const ReminderForm = ({ onAddReminder, onCancel }: ReminderFormProps) => {
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    time: '',
    type: 'custom' as Reminder['type']
  });
  const [createAlarm, setCreateAlarm] = useState(false);

  const handleSubmit = async () => {
    if (!newReminder.title || !newReminder.time) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Preencha o título e horário do lembrete.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('➕ Criando lembrete motivacional:', newReminder);
    
    // Cria o lembrete no app
    onAddReminder({
      title: newReminder.title,
      description: newReminder.description,
      time: newReminder.time,
      type: newReminder.type,
      isActive: true
    });

    // Se solicitado, cria também um alarme no sistema
    if (createAlarm) {
      console.log('⏰ Criando alarme do sistema também...');
      const alarmCreated = await createSystemAlarm(
        newReminder.title, 
        newReminder.time, 
        newReminder.description
      );
      
      if (alarmCreated) {
        toast({
          title: "🎯 Lembrete + Alarme criados!",
          description: `Notificação às ${newReminder.time} + alarme no relógio! ⏰🔔`,
        });
      } else {
        toast({
          title: "🎯 Lembrete criado!",
          description: `Você receberá uma notificação motivacional às ${newReminder.time}! ⏰`,
        });
      }
    } else {
      toast({
        title: "🎯 Lembrete criado!",
        description: `Você receberá uma notificação motivacional às ${newReminder.time}! ⏰`,
      });
    }

    setNewReminder({ title: '', description: '', time: '', type: 'custom' });
    setCreateAlarm(false);
  };

  return (
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
      
      {/* Opção para criar alarme no sistema */}
      {isAlarmSupported() && (
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Checkbox
            id="create-alarm"
            checked={createAlarm}
            onCheckedChange={setCreateAlarm}
            className="data-[state=checked]:bg-blue-600"
          />
          <label 
            htmlFor="create-alarm" 
            className="text-sm font-medium text-blue-700 flex items-center gap-2 cursor-pointer"
          >
            <AlarmClock className="h-4 w-4" />
            Criar também um alarme no relógio do Android
          </label>
        </div>
      )}
      
      <div className="flex gap-3">
        <Button 
          onClick={handleSubmit} 
          className="bg-green-600 hover:bg-green-700 shadow-lg transform hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Lembrete
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-300 hover:bg-gray-50"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};
