import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static expoPushToken = null;

  /**
   * Initialize notification service
   */
  static async initialize() {
    try {
      // Request permissions
      const { status } = await this.requestPermissions();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Get push token
      const token = await this.getExpoPushToken();
      this.expoPushToken = token;

      // Set up notification listeners
      this.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SchoolBridge Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E86AB',
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return { status: finalStatus };
  }

  /**
   * Get Expo push token
   */
  static async getExpoPushToken() {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);

      // Store token for API registration
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);

      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Set up notification listeners
   */
  static setupNotificationListeners() {
    // Listener for when notification is received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle notification received
   */
  static handleNotificationReceived(notification) {
    const { title, body, data } = notification.request.content;

    // You can customize behavior based on notification type
    switch (data?.type) {
      case 'assignment':
        // Handle assignment notifications
        break;
      case 'grade':
        // Handle grade notifications
        break;
      case 'attendance':
        // Handle attendance notifications
        break;
      default:
        // Handle general notifications
        break;
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  static handleNotificationResponse(response) {
    const { data } = response.notification.request.content;

    // Navigate to appropriate screen based on notification data
    if (data?.screen) {
      // You'll implement navigation logic here
      console.log('Navigate to:', data.screen, 'with params:', data.params);
    }
  }

  /**
   * Schedule local notification
   */
  static async scheduleLocalNotification(
    title,
    body,
    data = {},
    scheduledTime = null,
  ) {
    try {
      const notificationContent = {
        title,
        body,
        data,
        sound: 'default',
      };

      if (scheduledTime) {
        // Schedule for specific time
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: { date: new Date(scheduledTime) },
        });
      } else {
        // Send immediately
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: null,
        });
      }

      console.log('Local notification scheduled');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * Cancel notification by identifier
   */
  static async cancelNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('Notification cancelled:', identifier);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Get scheduled notifications
   */
  static async getScheduledNotifications() {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Register push token with backend
   */
  static async registerPushToken(userId, userRole) {
    try {
      if (!this.expoPushToken) {
        console.warn('No push token available');
        return false;
      }

      // You'll implement API call to register token with your backend
      console.log(
        'Registering push token for user:',
        userId,
        'role:',
        userRole,
      );

      // Example API call:
      // await apiService.user.registerPushToken({
      //   token: this.expoPushToken,
      //   userId,
      //   userRole,
      //   platform: Platform.OS,
      // });

      return true;
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  /**
   * Unregister push token
   */
  static async unregisterPushToken() {
    try {
      if (!this.expoPushToken) {
        return true;
      }

      // You'll implement API call to unregister token
      console.log('Unregistering push token');

      // Example API call:
      // await apiService.user.unregisterPushToken(this.expoPushToken);

      await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
      this.expoPushToken = null;

      return true;
    } catch (error) {
      console.error('Error unregistering push token:', error);
      return false;
    }
  }

  /**
   * Send local notification for assignment reminder
   */
  static async scheduleAssignmentReminder(assignment, reminderTime) {
    const title = '📝 Assignment Reminder';
    const body = `Don't forget: ${assignment.title} is due ${assignment.dueDate}`;
    const data = {
      type: 'assignment',
      assignmentId: assignment.id,
      screen: 'AssignmentDetails',
      params: { assignmentId: assignment.id },
    };

    await this.scheduleLocalNotification(title, body, data, reminderTime);
  }

  /**
   * Send local notification for new grade
   */
  static async notifyNewGrade(grade) {
    const title = '🎯 New Grade Available';
    const body = `You received ${grade.points}/${grade.maxPoints} on ${grade.assignmentTitle}`;
    const data = {
      type: 'grade',
      gradeId: grade.id,
      screen: 'GradeDetails',
      params: { gradeId: grade.id },
    };

    await this.scheduleLocalNotification(title, body, data);
  }

  /**
   * Send local notification for attendance alert
   */
  static async notifyAttendanceAlert(attendanceData) {
    const title = '⚠️ Attendance Alert';
    const body = `Your attendance is ${attendanceData.percentage}%. Please improve.`;
    const data = {
      type: 'attendance',
      screen: 'Attendance',
    };

    await this.scheduleLocalNotification(title, body, data);
  }

  /**
   * Send local notification for class schedule
   */
  static async scheduleClassReminder(classInfo, reminderTime) {
    const title = '🎓 Class Reminder';
    const body = `${classInfo.subject} starts in 15 minutes at ${classInfo.room}`;
    const data = {
      type: 'class',
      classId: classInfo.id,
      screen: 'Schedule',
    };

    await this.scheduleLocalNotification(title, body, data, reminderTime);
  }
}

export default NotificationService;
