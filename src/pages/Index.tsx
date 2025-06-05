
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, BookOpen, FolderOpen, Target, CheckCircle, PlayCircle, PauseCircle } from "lucide-react";
import { TaskManager } from "@/components/TaskManager";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { BookTracker } from "@/components/BookTracker";
import { ProjectsSection } from "@/components/ProjectsSection";
import { useTasks } from "@/hooks/useTasks";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useBooks } from "@/hooks/useBooks";

const Index = () => {
  const { tasks } = useTasks();
  const { stats } = usePomodoro();
  const { books } = useBooks();
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const pagesReadToday = books.reduce((total, book) => total + book.currentPage, 0);

  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">FocusFlow</h1>
              <p className="text-sm text-gray-600 capitalize">{today}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {completedTasks}/{totalTasks} tarefas
              </Badge>
              {totalTasks > 0 && (
                <Progress value={(completedTasks / totalTasks) * 100} className="w-24" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Tarefas</span>
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Leituras</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Projetos</span>
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Foco</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Today's Summary */}
              <Card className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                    <CalendarCheck className="h-5 w-5" />
                    Resumo de Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tarefas completadas</span>
                    <Badge className="bg-green-100 text-green-700">{completedTasks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Páginas lidas</span>
                    <Badge className="bg-blue-100 text-blue-700">{pagesReadToday}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pomodoros hoje</span>
                    <Badge className="bg-purple-100 text-purple-700">{stats.completedPomodoros}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Pomodoro */}
              <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                    <Clock className="h-5 w-5" />
                    Foco Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PomodoroTimer />
                </CardContent>
              </Card>

              {/* Priority Tasks */}
              <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                    <Target className="h-5 w-5" />
                    Prioridade Alta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.filter(task => task.priority === 'high' && !task.completed).slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="text-sm">{task.title}</span>
                    </div>
                  ))}
                  {tasks.filter(task => task.priority === 'high' && !task.completed).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma tarefa de alta prioridade</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-700">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-16 flex flex-col gap-1 hover:bg-blue-50 border-blue-200">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-xs">Nova Tarefa</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-1 hover:bg-green-50 border-green-200">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-xs">Adicionar Livro</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-1 hover:bg-purple-50 border-purple-200">
                    <FolderOpen className="h-5 w-5" />
                    <span className="text-xs">Novo Projeto</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-1 hover:bg-orange-50 border-orange-200">
                    <Target className="h-5 w-5" />
                    <span className="text-xs">Iniciar Foco</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager />
          </TabsContent>

          <TabsContent value="books">
            <BookTracker />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsSection />
          </TabsContent>

          <TabsContent value="focus">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
              <CardHeader>
                <CardTitle className="text-xl text-center text-purple-700">Sessão de Foco</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PomodoroTimer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
