
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  time: string; // HH:MM format
  type: 'task' | 'reading' | 'project' | 'break' | 'custom';
  relatedId?: string; // ID da tarefa/livro/projeto relacionado
  isActive: boolean;
  useBalloonStyle?: boolean; // Nova propriedade para estilo de balão
  createSystemAlarm?: boolean; // Nova propriedade para criar alarme do sistema
  createdAt: string;
  localNotificationId?: number; // ID da notificação local agendada
}
