
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clock, MessageCircle } from 'lucide-react';
import { Reminder } from '@/hooks/useReminders';
import { isNativeAndroid } from '@/utils/firebaseNotifications';

interface ReminderFormProps {
  onAddReminder: (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({ onAddReminder, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<Reminder['type']>('task');
  const [isActive, setIsActive] = useState(true);
  const [useBalloonStyle, setUseBalloonStyle] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !time) return;
    
    onAddReminder({
      title,
      description,
      time,
      type,
      isActive,
      useBalloonStyle: isNativeAndroid() ? useBalloonStyle : false,
    });
    
    // Limpa o formulário
    setTitle('');
    setDescription('');
    setTime('');
    setType('task');
    setIsActive(true);
    setUseBalloonStyle(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Input
          placeholder="Título do lembrete"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={50}
          className="border-green-200"
        />
        
        <Textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-green-200"
          maxLength={200}
        />
        
        <div className="flex flex-wrap gap-3">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <label className="text-sm text-gray-600 mb-1 block">Horário</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="pl-9 border-green-200"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-1/2 md:w-1/3">
            <label className="text-sm text-gray-600 mb-1 block">Tipo</label>
            <Select value={type} onValueChange={(value: Reminder['type']) => setType(value)}>
              <SelectTrigger className="border-green-200">
                <SelectValue placeholder="Tipo de lembrete" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Tarefa</SelectItem>
                <SelectItem value="reading">Leitura</SelectItem>
                <SelectItem value="project">Projeto</SelectItem>
                <SelectItem value="break">Pausa</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              id="active-status"
            />
            <Label htmlFor="active-status">Lembrete ativo</Label>
          </div>
          
          {isNativeAndroid() && (
            <div className="flex items-center space-x-2">
              <Switch
                checked={useBalloonStyle}
                onCheckedChange={setUseBalloonStyle}
                id="balloon-style"
              />
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <Label htmlFor="balloon-style">Estilo balão</Label>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Criar Lembrete
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="border-green-200 text-green-700"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};
