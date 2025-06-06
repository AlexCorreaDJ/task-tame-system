
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Permission } from "@/types/permissions";
import { PermissionStatusBadge } from "./PermissionStatusBadge";

interface PermissionItemProps {
  permission: Permission;
  onRequest: (permissionId: string) => void;
}

export const PermissionItem = ({ permission, onRequest }: PermissionItemProps) => {
  const IconComponent = permission.icon;

  return (
    <div className="flex items-start gap-3 p-3 md:p-4 border rounded-lg bg-white">
      <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-blue-600 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
          <h3 className="font-medium text-gray-800 text-sm md:text-base">{permission.name}</h3>
          {permission.isRequired && (
            <Badge variant="outline" className="bg-orange-100 text-orange-700 text-xs w-fit">
              Obrigatória
            </Badge>
          )}
        </div>
        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{permission.description}</p>
      </div>
      
      <div className="flex flex-col gap-2 items-end">
        <PermissionStatusBadge status={permission.status} />
        
        {permission.status !== 'granted' && (
          <Button
            size="sm"
            onClick={() => onRequest(permission.id)}
            className="bg-blue-600 hover:bg-blue-700 text-xs h-8 px-3"
          >
            Permitir
          </Button>
        )}
      </div>
    </div>
  );
};
