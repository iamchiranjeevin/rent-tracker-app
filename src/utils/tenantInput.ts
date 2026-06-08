import type { TenantInput } from '../types/tenant';
import { clampDueDay, clampReminderHour, clampReminderMinute } from './date';

export function validateTenantInput(input: TenantInput) {
  if (!input.name.trim()) {
    return 'Tenant name is required.';
  }

  if (input.rentAmount <= 0) {
    return 'Monthly rent amount must be greater than zero.';
  }

  return null;
}

export function normalizeTenantInput(input: TenantInput): TenantInput {
  return {
    ...input,
    name: input.name.trim(),
    notes: input.notes.trim(),
    phone: input.phone.trim(),
    reminderHour: clampReminderHour(input.reminderHour),
    reminderMinute: clampReminderMinute(input.reminderMinute ?? 0),
    rentAmount: Number(input.rentAmount),
    rentDueDay: clampDueDay(input.rentDueDay),
    unit: input.unit.trim(),
  };
}
