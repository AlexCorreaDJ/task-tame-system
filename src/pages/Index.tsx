
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskManager } from "@/components/TaskManager";
import { BookTracker } from "@/components/BookTracker";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { ProjectsSection } from "@/components/ProjectsSection";
import { CalendarManager } from "@/components/CalendarManager";
import { PermissionsManager } from "@/components/PermissionsManager";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { DateTimeDisplay } from "@/components/DateTimeDisplay";
import { CheckSquare, BookOpen, Clock, FolderKanban, Calendar, Shield } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("permissions");

  const tabs = [
    { id: "permissions", label: "Permissões", icon: Shield, component: PermissionsManager },
    { id: "tasks", label: "Tarefas", icon: CheckSquare, component: TaskManager },
    { id: "books", label: "Leitura", icon: BookOpen, component: BookTracker },
    { id: "pomodoro", label: "Sessão de Foco", icon: Clock, component: PomodoroTimer },
    { id: "projects", label: "Projetos", icon: FolderKanban, component: ProjectsSection },
    { id: "calendar", label: "Calendário", icon: Calendar, component: CalendarManager },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || PermissionsManager;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Profile Menu and DateTime */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Produtividade TDAH
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <DateTimeDisplay />
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Component */}
        <ActiveComponent />
      </div>
    </div>
  );
};

export default Index;
