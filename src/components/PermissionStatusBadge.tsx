
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Permission } from "@/types/permissions";

interface PermissionStatusBadgeProps {
  status: Permission['status'];
}

export const PermissionStatusBadge = ({ status }: PermissionStatusBadgeProps) => {
  const getStatusIcon = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'prompt':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'denied':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'prompt':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return 'Concedida';
      case 'denied':
        return 'Negada';
      case 'prompt':
        return 'Pendente';
      default:
        return 'Desconhecida';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor(status)} text-xs`}>
      {getStatusIcon(status)}
      <span className="ml-1">{getStatusText(status)}</span>
    </Badge>
  );
};
