
import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(new Date());
    };

    // Atualiza imediatamente
    updateDateTime();

    // Atualiza a cada segundo
    const interval = setInterval(updateDateTime, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-4 text-sm text-blue-600/80">
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span className="capitalize">{formatDate(currentDateTime)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span className="font-mono">{formatTime(currentDateTime)}</span>
      </div>
    </div>
  );
};
