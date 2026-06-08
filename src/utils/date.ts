export function toIsoNow() {
  return new Date().toISOString();
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    currency: 'INR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}

export function clampDueDay(value: number) {
  if (Number.isNaN(value)) {
    return 1;
  }

  return Math.min(31, Math.max(1, Math.round(value)));
}

export function clampReminderHour(value: number) {
  if (Number.isNaN(value)) {
    return 9;
  }

  return Math.min(23, Math.max(0, Math.round(value)));
}

export function clampReminderMinute(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(59, Math.max(0, Math.round(value)));
}
