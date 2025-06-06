
import { Button } from "@/components/ui/button";
import { Bell, BellPlus } from "lucide-react";

interface NotificationPermissionBannerProps {
  hasPermission: boolean;
  onRequestPermission: () => void;
}

export const NotificationPermissionBanner = ({ 
  hasPermission, 
  onRequestPermission 
}: NotificationPermissionBannerProps) => {
  if (hasPermission) {
    return (
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
    );
  }

  return (
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
          onClick={onRequestPermission}
          className="bg-yellow-600 hover:bg-yellow-700 shadow-lg transform hover:scale-105 transition-all"
        >
          <BellPlus className="h-4 w-4 mr-2" />
          Ativar Agora!
        </Button>
      </div>
    </div>
  );
};
