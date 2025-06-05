
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, Calendar, Coffee, Brain, Trash2 } from "lucide-react";
import { useDailyPlanning, DailyPlanItem } from "@/hooks/useDailyPlanning";

export const DailyPlanning = () => {
  const { todayPlan, addPlanItem, deletePlanItem, togglePlanItem, createTDAHTemplate } = useDailyPlanning();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    time: '',
    activity: '',
    description: '',
    isBreak: false,
    duration: 30
  });

  const handleAddItem = () => {
    if (!newItem.time || !newItem.activity) return;
    
    addPlanItem({
      time: newItem.time,
      activity: newItem.activity,
      description: newItem.description,
      isBreak: newItem.isBreak,
      duration: newItem.duration
    });

    setNewItem({ time: '', activity: '', description: '', isBreak: false, duration: 30 });
    setShowAddForm(false);
  };

  const completedItems = todayPlan.filter(item => item.completed).length;
  const progressPercent = todayPlan.length > 0 ? (completedItems / todayPlan.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Planejamento Diário TDAH
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={createTDAHTemplate}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Brain className="h-4 w-4 mr-2" />
                Template TDAH
              </Button>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {completedItems}/{todayPlan.length} concluídos
            </Badge>
            <div className="text-sm text-gray-600">
              Progresso: {Math.round(progressPercent)}%
            </div>
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-purple-100 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="time"
                  value={newItem.time}
                  onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                  placeholder="Horário"
                />
                <Input
                  placeholder="Atividade"
                  value={newItem.activity}
                  onChange={(e) => setNewItem({...newItem, activity: e.target.value})}
                />
              </div>
              <Textarea
                placeholder="Descrição (opcional)"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isBreak"
                    checked={newItem.isBreak}
                    onCheckedChange={(checked) => setNewItem({...newItem, isBreak: !!checked})}
                  />
                  <label htmlFor="isBreak" className="text-sm">É uma pausa/descanso</label>
                </div>
                <Input
                  type="number"
                  placeholder="Duração (minutos)"
                  value={newItem.duration}
                  onChange={(e) => setNewItem({...newItem, duration: Number(e.target.value)})}
                  min="5"
                  max="480"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                  Adicionar
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Timeline do dia */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayPlan.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Nenhum planejamento para hoje!</p>
              <p className="text-sm text-gray-400 mb-4">
                Use o template TDAH para começar com uma estrutura recomendada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayPlan.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    item.completed 
                      ? 'bg-green-50 border-green-200 opacity-70' 
                      : item.isBreak 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => togglePlanItem(item.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.time}
                      </Badge>
                      {item.isBreak && (
                        <Coffee className="h-4 w-4 text-orange-500" />
                      )}
                      <h3 className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {item.activity}
                      </h3>
                    </div>
                    
                    {item.description && (
                      <p className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.duration} min
                      </Badge>
                      {item.isBreak ? (
                        <Badge className="bg-orange-100 text-orange-700 text-xs">Pausa</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Foco</Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlanItem(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
