import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useTimetableNotifications() {
  useEffect(() => {
    async function requestPermissions() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted!');
        return false;
      }
      return true;
    }
    
    if (Platform.OS !== 'web') {
      requestPermissions();
    }
  }, []);

  const scheduleClassNotifications = async (timetable: any[]) => {
    // Clear old notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Safety check
    if (!timetable || timetable.length === 0) return;

    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayStr = days[today.getDay()];

    const todaysClasses = timetable.filter(t => t.day_of_week === todayStr);

    for (const slot of todaysClasses) {
      // Parse start_time (e.g. "09:00:00")
      const [hours, minutes] = slot.start_time.split(':').map(Number);
      
      const classTime = new Date();
      classTime.setHours(hours, minutes, 0, 0);

      // Notification time is 5 minutes before class
      const notifyTime = new Date(classTime.getTime() - 5 * 60000);

      // Only schedule if it's in the future
      if (notifyTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Upcoming Class: ${slot.course_code}`,
            body: `Your period ${slot.period_number} class (${slot.target_department}-${slot.target_section}) starts in 5 minutes!`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notifyTime,
          },
        });
      }
    }
  };

  const scheduleTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test alert for your timetable system.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  };

  return { scheduleClassNotifications, scheduleTestNotification };
}
