// Request notification permission on app load
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

// Show notification when session ends
export const showSessionEndNotification = (sessionType: 'focus' | 'break'): void => {
  if (Notification.permission !== "granted") return;

  const title = sessionType === 'focus' 
    ? '🎯 Focus Session Complete!' 
    : '☕ Break Session Complete!';
    
  const body = sessionType === 'focus'
    ? 'Great work! Time for a well-deserved break.'
    : 'Break time is over. Ready to focus again?';

  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico', // You can add a custom icon later
    badge: '/favicon.ico',
    tag: 'pomodoro-timer', // Prevents multiple notifications stacking
    requireInteraction: true, // Keeps notification visible until user interacts
  });

  // Auto-close after 20 seconds if user doesn't interact
  setTimeout(() => {
    notification.close();
  }, 20000);
};

// Play alarm sound when session ends
export const playAlarmSound = (sessionType: 'focus' | 'break'): void => {
  // Create different melodies for focus vs break sessions
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playNote = (frequency: number, duration: number, startTime: number, volume: number = 0.2) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02); // Quick fade in
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Fade out
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const baseTime = audioContext.currentTime;
  const noteDuration = 1.2; // Each note lasts 1.2 seconds for smooth overlap
  
  if (sessionType === 'focus') {
    // Focus end: Descending melody C6 → G5 → E5 → C5 (completion, rest)
    playNote(1047, noteDuration, baseTime + 0.0); // C6
    playNote(784, noteDuration, baseTime + 1.0);  // G5  
    playNote(659, noteDuration, baseTime + 2.0);  // E5
    playNote(523, noteDuration * 5, baseTime + 3.0); // C5 (longer ending)
  } else {
    // Break end: Ascending melody C5 → E5 → G5 → C6 (energizing, ready to work)
    playNote(523, noteDuration, baseTime + 0.0); // C5
    playNote(659, noteDuration, baseTime + 1.0); // E5
    playNote(784, noteDuration, baseTime + 2.0); // G5
    playNote(1047, noteDuration * 5, baseTime + 3.0); // C6 (longer ending)
  }
};

// Main function to trigger all notifications
export const triggerSessionEndAlert = (sessionType: 'focus' | 'break'): void => {  
  // Play sound
  try {
    playAlarmSound(sessionType);
  } catch (error) {
    console.error('Failed to play alarm sound:', error);
  }

  // Show notification
  try {
    showSessionEndNotification(sessionType);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};