import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, Brain, Bell, Plus, Clock, Trash2 } from "lucide-react";
import { useTasks, Task } from "@/hooks/useTasks";
import { DailyPlanning } from "./DailyPlanning";
import { ReminderManager } from "./ReminderManager";

export const TaskManager = () => {
  const { tasks, addTask, deleteTask, toggleTask } = useTasks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    estimatedTime: ''
  });

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  const priorityDots = {
    high: 'bg-red-400',
    medium: 'bg-orange-400',
    low: 'bg-yellow-400'
  };

  const handleAddTask = () => {
    if (!newTask.title) return;
    
    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      estimatedTime: newTask.estimatedTime
    });

    setNewTask({ title: '', description: '', priority: 'medium', estimatedTime: '' });
    setShowAddForm(false);
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/50 backdrop-blur-sm">
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Tarefas
        </TabsTrigger>
        <TabsTrigger value="planning" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Planejamento
        </TabsTrigger>
        <TabsTrigger value="reminders" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Lembretes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tasks" className="space-y-6">
        {/* Add Task Form */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-700">Gerenciar Tarefas</CardTitle>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </CardHeader>
          
          {showAddForm && (
            <CardContent className="border-t border-blue-100 pt-4">
              <div className="space-y-4">
                <Input
                  placeholder="Título da tarefa"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={2}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask({...newTask, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta Prioridade</SelectItem>
                      <SelectItem value="medium">Média Prioridade</SelectItem>
                      <SelectItem value="low">Baixa Prioridade</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tempo estimado (ex: 2h, 30min)"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTask} className="bg-green-600 hover:bg-green-700">
                    Adicionar Tarefa
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Pending Tasks */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
              <Circle className="h-5 w-5" />
              Tarefas Pendentes ({pendingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma tarefa pendente! 🎉</p>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${priorityDots[task.priority]}`}></div>
                      <h3 className="font-medium text-gray-800">{task.title}</h3>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={priorityColors[task.priority]}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                      {task.estimatedTime && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.estimatedTime}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Tarefas Concluídas ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200 opacity-70">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-600 line-through">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 line-through">{task.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="planning">
        <DailyPlanning />
      </TabsContent>

      <TabsContent value="reminders">
        <ReminderManager />
      </TabsContent>
    </Tabs>
  );
};
