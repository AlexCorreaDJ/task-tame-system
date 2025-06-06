
import { Permission } from "@/types/permissions";
import { Bell, HardDrive, Clock } from "lucide-react";

export const defaultPermissions: Permission[] = [
  {
    id: 'notifications',
    name: 'Notificações do Sistema',
    description: 'Receber notificações nativas com som para lembretes e alertas importantes',
    icon: Bell,
    status: 'unknown',
    isRequired: true
  },
  {
    id: 'storage',
    name: 'Armazenamento Local',
    description: 'Salvar dados localmente no dispositivo para funcionamento offline',
    icon: HardDrive,
    status: 'unknown',
    isRequired: true
  },
  {
    id: 'wakeLock',
    name: 'Manter Tela Ativa',
    description: 'Manter a tela ativa durante sessões de foco para melhor experiência',
    icon: Clock,
    status: 'unknown',
    isRequired: false
  }
];
