import { toast } from 'sonner';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Este browser não suporta notificações de desktop');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    
    // Create oscillator and gain node
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn('AudioContext not supported or blocked', e);
  }
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  // Always trigger in-app toast
  if (options?.icon && options.icon.includes('silver')) {
     toast.success(title, { description: options?.body, duration: 8000 });
  } else {
     toast.info(title, { description: options?.body, duration: 8000 });
  }

  // Also try desktop notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.error('Falha ao enviar notificação desktop', e);
    }
  }
};
