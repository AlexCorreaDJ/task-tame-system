let audio: HTMLAudioElement | null = null;

export const initializeAudio = () => {
  if (!audio) {
    audio = new Audio('/sounds/notification.mp3');
    audio.load();
  }
};

export const playNotificationSound = () => {
  if (!audio) {
    audio = new Audio('/sounds/notification.mp3');
    audio.load();
  }

  audio?.play().catch(error => {
    console.warn('⚠️ Erro ao reproduzir som de notificação:', error);
  });
};
