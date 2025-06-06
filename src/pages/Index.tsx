
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
import { CheckSquare, BookOpen, Clock, FolderKanban, Calendar, Shield, Menu } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("permissions");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: "permissions", label: "Permissões", icon: Shield, component: PermissionsManager },
    { id: "tasks", label: "Tarefas", icon: CheckSquare, component: TaskManager },
    { id: "books", label: "Leitura", icon: BookOpen, component: BookTracker },
    { id: "pomodoro", label: "Foco", icon: Clock, component: PomodoroTimer },
    { id: "projects", label: "Projetos", icon: FolderKanban, component: ProjectsSection },
    { id: "calendar", label: "Calendário", icon: Calendar, component: CalendarManager },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || PermissionsManager;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile-optimized Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TDAHFOCUS
              </h1>
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
              <div className="hidden sm:block">
                <DateTimeDisplay />
              </div>
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Navigation */}
      <div className="container mx-auto px-4 py-4">
        {/* Mobile tab selector */}
        <div className="block md:hidden mb-4">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Menu</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
              
              {isMenuOpen && (
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "outline"}
                      className={`flex items-center gap-2 text-sm ${
                        activeTab === tab.id 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      }`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMenuOpen(false);
                      }}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </Button>
                  ))}
                </div>
              )}
              
              {!isMenuOpen && (
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desktop Navigation Tabs */}
        <Card className="hidden md:block mb-6 bg-white/70 backdrop-blur-sm border-blue-200">
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

        {/* Active Component with mobile padding */}
        <div className="pb-safe">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default Index;
