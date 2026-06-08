import * as Notifications from 'expo-notifications';

import { updateTenantNotification } from '../data/tenantRepository';
import type { Tenant } from '../types/tenant';
import { formatCurrency } from '../utils/date';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleTenantReminder(tenant: Tenant) {
  if (tenant.status !== 'active') {
    return null;
  }

  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  if (tenant.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(tenant.notificationId);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      body: `${tenant.name}${tenant.unit ? ` (${tenant.unit})` : ''} rent due: ${formatCurrency(
        tenant.rentAmount,
      )}`,
      sound: true,
      title: 'Rent reminder',
    },
    trigger: {
      day: tenant.rentDueDay,
      hour: tenant.reminderHour,
      minute: tenant.reminderMinute ?? 0,
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
    },
  });

  await updateTenantNotification(tenant.id, notificationId);
  return notificationId;
}

export async function cancelTenantReminder(tenant: Tenant) {
  if (!tenant.notificationId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(tenant.notificationId);
  await updateTenantNotification(tenant.id, null);
}

export async function rescheduleAllTenantReminders(tenants: Tenant[]) {
  for (const tenant of tenants) {
    if (tenant.status === 'active') {
      await scheduleTenantReminder(tenant);
    }
  }
}
