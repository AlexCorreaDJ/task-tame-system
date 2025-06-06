
import { Permission } from "@/types/permissions";
import { Bell, HardDrive, Clock } from "lucide-react";

export const defaultPermissions: Permission[] = [
  {
    id: 'notifications',
    name: 'Lembretes',
    description: 'Receber lembretes de tarefas (no sistema ou dentro do app)',
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
