import type { Tenant } from '../types/tenant';
import { formatCurrency } from './date';

export function getPhoneDigits(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

export function buildRentReminderMessage(tenant: Tenant) {
  const reminderTime = `${tenant.reminderHour.toString().padStart(2, '0')}:${(tenant.reminderMinute ?? 0).toString().padStart(2, '0')}`;

  return `Hi ${tenant.name}, gentle reminder that your monthly rent of ${formatCurrency(
    tenant.rentAmount,
  )} is due on day ${tenant.rentDueDay}. Reminder every ${reminderTime} until marked paid. Thank you.`;
}

export function buildWhatsAppUrl(tenant: Tenant) {
  const phoneDigits = getPhoneDigits(tenant.phone);
  const message = encodeURIComponent(buildRentReminderMessage(tenant));

  return `https://wa.me/${phoneDigits}?text=${message}`;
}

export function buildCallUrl(phone: string) {
  return `tel:${getPhoneDigits(phone)}`;
}
