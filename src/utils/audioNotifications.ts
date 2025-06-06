
/**
 * Utilitário para gerenciar notificações de áudio
 */

// Audio para notificações
let notificationSound: HTMLAudioElement | null = null;

// Inicializa o áudio (deve ser chamado após interação do usuário)
export const initializeAudio = () => {
  try {
    if (!notificationSound && typeof window !== 'undefined') {
      notificationSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+NAwAAAAAAAAAAAAFhpbmcAAAAPAAAAAwAABPEAVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZW//////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuMTAwBGwAAAAAAAAAABUgJAaUQQABrgAAAQTxay2eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/40DEACIcjdXhTGAAqBGKvJMwABF4GHw+Hw+QYfAQBAEAwjgyYceDh8sMhkCgyYLA4JjxYcGGRCGQyELj+XHi44YfD4fD5AQDhw+JxOPEIZMODIMQjx4+IQyYQwQIBg4ODB4smTJh/8MPh8gIBwuHxOJ0xAAAAAAAAMmEMmHBhgYMGDBw0ePHj4hAYMGDi8fIQz//L5fL5AQEBgYGEgIBAIEDhw+Hx8sMGDBgwYMmTBgwYMGDBgYEDAwMJgQCAQCAQOHw+Hyw+QEAgEDAQCBgwYMGK2UAIQAG+ggR//OCwP8AJLolb9gwAOVOvLDrBjAAgIFXxu7jQxUVFdimtra2ve9773vWtra2svLy8vLy8vLa2tra97rerW1tbW8vLy8vLy8rerW1tbXvfBCp5eXl5bW1tbWsK8vLy2t6IFPW9WsVFRUVFRXYpABVWtra2tra1vVr3vUgAqrW9WtYqKioqKiuyACUADgAAFxsY1Etc3KQkWpSanN2zC1SVWsrKjOB0JZbw8NVYU+bxL3lZXZH1eZHl1hYXWVhblGWcuNnVkVGj3Kooortu4+ZZxLVHHUtitxtLqrY5HwV6O+whvUxBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MQxMUAAANIAcAAAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
      
      // Configurar volume e mudo
      if (notificationSound) {
        notificationSound.volume = 0.7;
        notificationSound.muted = false;
      }
      
      console.log('🔊 Sistema de áudio inicializado');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Erro ao inicializar áudio:', error);
    return false;
  }
};

// Tocar som de notificação
export const playNotificationSound = () => {
  try {
    if (!notificationSound) {
      initializeAudio();
    }
    
    if (notificationSound) {
      // Reinicia o áudio para garantir que toque mesmo que já esteja tocando
      notificationSound.currentTime = 0;
      
      // Tenta tocar o áudio (retorna uma Promise)
      const playPromise = notificationSound.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('🔔 Som de notificação tocado'))
          .catch(error => console.error('❌ Erro ao tocar som:', error));
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Erro ao tocar notificação sonora:', error);
    return false;
  }
};

