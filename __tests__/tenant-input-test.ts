import { normalizeTenantInput, validateTenantInput } from '../src/utils/tenantInput';

describe('tenant input helpers', () => {
  test('validates required name and positive rent amount', () => {
    expect(
      validateTenantInput({
        name: '',
        notes: '',
        phone: '',
        reminderHour: 9,
        reminderMinute: 0,
        rentAmount: 15000,
        rentDueDay: 5,
        unit: '',
      }),
    ).toBe('Tenant name is required.');

    expect(
      validateTenantInput({
        name: 'Ravi',
        notes: '',
        phone: '',
        reminderHour: 9,
        reminderMinute: 0,
        rentAmount: 0,
        rentDueDay: 5,
        unit: '',
      }),
    ).toBe('Monthly rent amount must be greater than zero.');
  });

  test('sanitizes tenant form details before saving', () => {
    expect(
      normalizeTenantInput({
        name: '  Ravi  ',
        notes: '  Pays online  ',
        phone: ' +91 98765 43210 ',
        reminderHour: 24,
        reminderMinute: 15,
        rentAmount: 15000,
        rentDueDay: 35,
        unit: ' A-101 ',
      }),
    ).toEqual({
      name: 'Ravi',
      notes: 'Pays online',
      phone: '+91 98765 43210',
      reminderHour: 23,
      reminderMinute: 15,
      rentAmount: 15000,
      rentDueDay: 31,
      unit: 'A-101',
    });
  });
});
