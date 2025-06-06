
import { Permission } from "@/types/permissions";
import { Bell, HardDrive, Clock } from "lucide-react";

export const defaultPermissions: Permission[] = [
  {
    id: 'notifications',
    name: 'Notificações do Sistema Android',
    description: 'Receber notificações nativas do Android com som para lembretes e alertas',
    icon: Bell,
    status: 'unknown',
    isRequired: true
  },
  {
    id: 'storage',
    name: 'Armazenamento Local Android',
    description: 'Salvar dados localmente no dispositivo Android',
    icon: HardDrive,
    status: 'unknown',
    isRequired: true
  },
  {
    id: 'wakeLock',
    name: 'Manter Tela Ativa Android',
    description: 'Manter a tela do Android ativa durante sessões de foco',
    icon: Clock,
    status: 'unknown',
    isRequired: false
  }
];
