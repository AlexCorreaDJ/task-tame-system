
import { useLocalStorage } from './useLocalStorage';

export interface PomodoroStats {
  completedPomodoros: number;
  totalFocusTime: number; // in minutes
  todayDate: string;
}

export const usePomodoro = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const [stats, setStats] = useLocalStorage<PomodoroStats>('focusflow-pomodoro', {
    completedPomodoros: 0,
    totalFocusTime: 0,
    todayDate: today
  });

  // Reset stats if it's a new day
  const currentStats = stats.todayDate === today ? stats : {
    completedPomodoros: 0,
    totalFocusTime: 0,
    todayDate: today
  };

  const incrementPomodoro = () => {
    const newStats = {
      ...currentStats,
      completedPomodoros: currentStats.completedPomodoros + 1,
      totalFocusTime: currentStats.totalFocusTime + 25
    };
    setStats(newStats);
  };

  return {
    stats: currentStats,
    incrementPomodoro
  };
};
