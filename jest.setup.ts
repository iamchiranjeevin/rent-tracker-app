jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: {
    MONTHLY: 'monthly',
  },
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  setNotificationHandler: jest.fn(),
}));
