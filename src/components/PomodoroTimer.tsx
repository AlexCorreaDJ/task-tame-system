
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlayCircle, PauseCircle, RotateCcw, Coffee, Settings } from "lucide-react";
import { usePomodoro } from "@/hooks/usePomodoro";

export const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { stats, incrementPomodoro } = usePomodoro();

  const totalSeconds = isBreak ? breakTime * 60 : focusTime * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          if (isBreak) {
            // Break finished, back to work
            setIsBreak(false);
            setMinutes(focusTime);
            setSeconds(0);
          } else {
            // Pomodoro finished - increment stats
            incrementPomodoro();
            setIsBreak(true);
            setMinutes(breakTime);
            setSeconds(0);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds, isBreak, incrementPomodoro, focusTime, breakTime]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    if (isBreak) {
      setMinutes(breakTime);
    } else {
      setMinutes(focusTime);
    }
    setSeconds(0);
  };

  const skipBreak = () => {
    setIsBreak(false);
    setMinutes(focusTime);
    setSeconds(0);
    setIsActive(false);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfigSave = (newFocusTime: number, newBreakTime: number) => {
    setFocusTime(newFocusTime);
    setBreakTime(newBreakTime);
    
    // Reset timer with new settings if not running
    if (!isActive) {
      if (isBreak) {
        setMinutes(newBreakTime);
      } else {
        setMinutes(newFocusTime);
      }
      setSeconds(0);
    }
    
    setIsConfigOpen(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {/* Timer Display */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge 
            variant="outline" 
            className={`${isBreak ? 'bg-green-100 text-green-700 border-green-200' : 'bg-purple-100 text-purple-700 border-purple-200'} px-4 py-1`}
          >
            {isBreak ? (
              <>
                <Coffee className="h-4 w-4 mr-1" />
                Pausa ({breakTime}min)
              </>
            ) : (
              `Foco (${focusTime}min)`
            )}
          </Badge>
          
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Configurar Cronômetro</DialogTitle>
              </DialogHeader>
              <TimerConfig 
                focusTime={focusTime}
                breakTime={breakTime}
                onSave={handleConfigSave}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="text-6xl font-mono font-bold text-gray-800">
          {formatTime(minutes, seconds)}
        </div>
        <Progress 
          value={progress} 
          className={`w-64 h-2 ${isBreak ? 'bg-green-100' : 'bg-purple-100'}`}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={toggle}
          size="lg"
          className={`${isBreak ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
        >
          {isActive ? (
            <>
              <PauseCircle className="h-5 w-5 mr-2" />
              Pausar
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5 mr-2" />
              {isBreak ? 'Iniciar Pausa' : 'Iniciar Foco'}
            </>
          )}
        </Button>
        
        <Button
          onClick={reset}
          variant="outline"
          size="lg"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Resetar
        </Button>

        {isBreak && (
          <Button
            onClick={skipBreak}
            variant="outline"
            size="lg"
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            Pular Pausa
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completedPomodoros}</div>
            <div className="text-xs text-gray-600">Pomodoros hoje</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m</div>
            <div className="text-xs text-gray-600">Tempo focado</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimerConfig = ({ 
  focusTime, 
  breakTime, 
  onSave 
}: { 
  focusTime: number; 
  breakTime: number; 
  onSave: (focusTime: number, breakTime: number) => void; 
}) => {
  const [newFocusTime, setNewFocusTime] = useState(focusTime);
  const [newBreakTime, setNewBreakTime] = useState(breakTime);

  const handleSave = () => {
    onSave(newFocusTime, newBreakTime);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="focus-time">Tempo de Foco (minutos)</Label>
        <Input
          id="focus-time"
          type="number"
          min="1"
          max="60"
          value={newFocusTime}
          onChange={(e) => setNewFocusTime(Number(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="break-time">Tempo de Pausa (minutos)</Label>
        <Input
          id="break-time"
          type="number"
          min="1"
          max="30"
          value={newBreakTime}
          onChange={(e) => setNewBreakTime(Number(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onSave(focusTime, breakTime)}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Salvar
        </Button>
      </div>
    </div>
  );
};
