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

export const sendNotification = (title: string, options?: NotificationOptions) => {
  // Always trigger in-app toast
  if (options?.icon && options.icon.includes('silver')) {
     toast.success(title, { description: options?.body });
  } else {
     toast.info(title, { description: options?.body });
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
