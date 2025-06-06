
import { Permission } from "@/types/permissions";
import { Bell, HardDrive, Clock } from "lucide-react";

export const defaultPermissions: Permission[] = [
  {
    id: 'notifications',
    name: 'Notificações Locais',
    description: 'Receber lembretes e alertas de tarefas no dispositivo',
    icon: Bell,
    status: 'unknown',
    isRequired: true
  },
  {
    id: 'storage',
    name: 'Armazenamento Local',
    description: 'Salvar dados localmente no dispositivo',
    icon: HardDrive,
    status: 'unknown',
    isRequired: true
  },
  {
    id: 'wakeLock',
    name: 'Manter Tela Ativa',
    description: 'Manter a tela ativa durante sessões de foco',
    icon: Clock,
    status: 'unknown',
    isRequired: false
  }
];
