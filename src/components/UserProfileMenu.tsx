
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Settings, LogOut, Bell, Clock, Palette, AlertCircle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";

export const UserProfileMenu = () => {
  const { profile, updateProfile, updatePreferences } = useUserProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileUpdate = (field: string, value: string) => {
    const success = updateProfile({ [field]: value });
    if (!success) {
      toast({
        title: "Erro de validação",
        description: "Verifique os dados inseridos",
        variant: "destructive"
      });
    } else {
      setValidationErrors([]);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso"
      });
    }
  };

  const handlePreferenceUpdate = (field: string, value: any) => {
    const success = updatePreferences({ [field]: value });
    if (!success) {
      toast({
        title: "Erro de validação",
        description: "Valor inválido para esta configuração",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências foram salvas"
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-blue-500 text-white">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais aqui.
            </DialogDescription>
          </DialogHeader>
          
          {validationErrors.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => handleProfileUpdate('name', e.target.value)}
                className="col-span-3"
                maxLength={50}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileUpdate('email', e.target.value)}
                className="col-span-3"
                placeholder="seu@email.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatar"
                type="url"
                value={profile.avatar || ''}
                onChange={(e) => handleProfileUpdate('avatar', e.target.value)}
                className="col-span-3"
                placeholder="https://exemplo.com/avatar.jpg"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsProfileOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>
              Ajuste suas preferências do aplicativo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="notifications">Notificações</Label>
              </div>
              <Switch
                id="notifications"
                checked={profile.preferences.notifications}
                onCheckedChange={(checked) => 
                  handlePreferenceUpdate('notifications', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <Label htmlFor="theme">Tema</Label>
              </div>
              <Select
                value={profile.preferences.theme}
                onValueChange={(value) => handlePreferenceUpdate('theme', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <Label>Configurações do Pomodoro</Label>
              </div>
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <Label htmlFor="pomodoroTime" className="text-sm">
                    Foco (min)
                  </Label>
                  <Input
                    id="pomodoroTime"
                    type="number"
                    value={profile.preferences.pomodoroTime}
                    onChange={(e) => 
                      handlePreferenceUpdate('pomodoroTime', parseInt(e.target.value))
                    }
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <Label htmlFor="breakTime" className="text-sm">
                    Pausa (min)
                  </Label>
                  <Input
                    id="breakTime"
                    type="number"
                    value={profile.preferences.breakTime}
                    onChange={(e) => 
                      handlePreferenceUpdate('breakTime', parseInt(e.target.value))
                    }
                    min="1"
                    max="30"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsSettingsOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
