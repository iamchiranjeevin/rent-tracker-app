export type TenantStatus = 'active' | 'inactive';

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  unit: string;
  rentAmount: number;
  rentDueDay: number;
  reminderHour: number;
  reminderMinute: number;
  notes: string;
  status: TenantStatus;
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TenantInput = Pick<
  Tenant,
  'name' | 'phone' | 'unit' | 'rentAmount' | 'rentDueDay' | 'reminderHour' | 'reminderMinute' | 'notes'
>;

export interface BackupPayload {
  app: 'rent-reminder-app';
  version: 1;
  exportedAt: string;
  tenants: Tenant[];
}
