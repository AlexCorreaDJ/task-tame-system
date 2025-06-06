
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskManager } from "@/components/TaskManager";
import { BookTracker } from "@/components/BookTracker";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { ProjectsSection } from "@/components/ProjectsSection";
import { CalendarManager } from "@/components/CalendarManager";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { DateTimeDisplay } from "@/components/DateTimeDisplay";
import { CheckSquare, BookOpen, Clock, FolderKanban, Calendar, Menu } from "lucide-react";

console.log('📄 Index.tsx carregado');

const Index = () => {
  console.log('🏠 Index component sendo renderizado...');
  
  const [activeTab, setActiveTab] = useState("tasks");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: "tasks", label: "Tarefas", icon: CheckSquare, component: TaskManager },
    { id: "books", label: "Leitura", icon: BookOpen, component: BookTracker },
    { id: "pomodoro", label: "Foco", icon: Clock, component: PomodoroTimer },
    { id: "projects", label: "Projetos", icon: FolderKanban, component: ProjectsSection },
    { id: "calendar", label: "Calendário", icon: Calendar, component: CalendarManager },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TaskManager;
  
  console.log(`🎯 Tab ativo: ${activeTab}, Component: ${ActiveComponent.name}`);

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Mobile-optimized Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
          <div className="px-4 py-4 md:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base md:text-sm">T</span>
                </div>
                <h1 className="text-xl md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TDAHFOCUS
                </h1>
              </div>
              
              <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden sm:block">
                  <DateTimeDisplay />
                </div>
                <UserProfileMenu />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-optimized Navigation */}
        <div className="px-4 py-6 md:py-4">
          {/* Mobile tab selector */}
          <div className="block md:hidden mb-6">
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-700">Menu</h3>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden h-12 w-12"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </div>
                
                {isMenuOpen && (
                  <div className="grid grid-cols-2 gap-4">
                    {tabs.map((tab) => (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "outline"}
                        className={`flex flex-col items-center gap-3 text-base h-20 ${
                          activeTab === tab.id 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMenuOpen(false);
                        }}
                      >
                        <tab.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
                
                {!isMenuOpen && (
                  <div className="text-center py-3">
                    <span className="text-base font-medium text-gray-600">
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
  } catch (error) {
    console.error('❌ Erro no Index component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro na página inicial</h1>
          <p className="text-red-500">Verifique o console para mais detalhes</p>
        </div>
      </div>
    );
  }
};

export default Index;
