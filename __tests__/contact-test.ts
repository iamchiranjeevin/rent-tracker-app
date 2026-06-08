import type { Tenant } from '../src/types/tenant';
import {
  buildCallUrl,
  buildRentReminderMessage,
  buildWhatsAppUrl,
  getPhoneDigits,
} from '../src/utils/contact';

const tenant: Tenant = {
  createdAt: '2026-06-08T00:00:00.000Z',
  id: 'tenant-1',
  name: 'Ravi',
  notes: '',
  notificationId: null,
  phone: '+91 98765-43210',
  reminderHour: 9,
  reminderMinute: 0,
  rentAmount: 15000,
  rentDueDay: 5,
  status: 'active',
  unit: 'A-101',
  updatedAt: '2026-06-08T00:00:00.000Z',
};

describe('tenant contact helpers', () => {
  test('normalizes phone number for WhatsApp and calls', () => {
    expect(getPhoneDigits(tenant.phone)).toBe('919876543210');
    expect(buildCallUrl(tenant.phone)).toBe('tel:919876543210');
  });

  test('builds rent reminder message and WhatsApp URL', () => {
    const message = buildRentReminderMessage(tenant);

    expect(message).toContain('Hi Ravi');
    expect(message).toContain('₹15,000');
    expect(message).toContain('Reminder every 09:00 until marked paid');
    expect(buildWhatsAppUrl(tenant)).toContain('https://wa.me/919876543210?text=');
    expect(decodeURIComponent(buildWhatsAppUrl(tenant))).toContain('rent of ₹15,000');
  });
});
