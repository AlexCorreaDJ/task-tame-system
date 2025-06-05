
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, PauseCircle, RotateCcw, Coffee } from "lucide-react";
import { usePomodoro } from "@/hooks/usePomodoro";

export const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { stats, incrementPomodoro } = usePomodoro();

  const totalSeconds = isBreak ? 5 * 60 : 25 * 60;
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
            setMinutes(25);
            setSeconds(0);
          } else {
            // Pomodoro finished - increment stats
            incrementPomodoro();
            setIsBreak(true);
            setMinutes(5);
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
  }, [isActive, minutes, seconds, isBreak, incrementPomodoro]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    if (isBreak) {
      setMinutes(5);
    } else {
      setMinutes(25);
    }
    setSeconds(0);
  };

  const skipBreak = () => {
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
    setIsActive(false);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {/* Timer Display */}
      <div className="text-center space-y-2">
        <Badge 
          variant="outline" 
          className={`${isBreak ? 'bg-green-100 text-green-700 border-green-200' : 'bg-purple-100 text-purple-700 border-purple-200'} px-4 py-1`}
        >
          {isBreak ? (
            <>
              <Coffee className="h-4 w-4 mr-1" />
              Pausa
            </>
          ) : (
            'Foco'
          )}
        </Badge>
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
