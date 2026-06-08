import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

import { getDatabase } from './database';
import type { Tenant, TenantInput } from '../types/tenant';
import { toIsoNow } from '../utils/date';

type TenantRow = {
  id: string;
  name: string;
  phone: string;
  unit: string;
  rentAmount: number;
  rentDueDay: number;
  reminderHour: number;
  reminderMinute: number;
  notes: string;
  status: Tenant['status'];
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listTenants() {
  const database = await getDatabase();
  return database.getAllAsync<TenantRow>(
    'SELECT * FROM tenants ORDER BY status ASC, rentDueDay ASC, name COLLATE NOCASE ASC',
  );
}

export async function createTenant(input: TenantInput) {
  const database = await getDatabase();
  const now = toIsoNow();
  const tenant: Tenant = {
    ...input,
    createdAt: now,
    id: uuidv4(),
    notificationId: null,
    status: 'active',
    updatedAt: now,
  };

  await database.runAsync(
    `INSERT INTO tenants (
      id, name, phone, unit, rentAmount, rentDueDay, reminderHour, reminderMinute, notes, status,
      notificationId, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    tenant.id,
    tenant.name,
    tenant.phone,
    tenant.unit,
    tenant.rentAmount,
    tenant.rentDueDay,
    tenant.reminderHour,
    tenant.reminderMinute ?? 0,
    tenant.notes,
    tenant.status,
    tenant.notificationId,
    tenant.createdAt,
    tenant.updatedAt,
  );

  return tenant;
}

export async function updateTenant(id: string, input: TenantInput) {
  const database = await getDatabase();
  const updatedAt = toIsoNow();

  await database.runAsync(
    `UPDATE tenants
     SET name = ?, phone = ?, unit = ?, rentAmount = ?, rentDueDay = ?,
       reminderHour = ?, reminderMinute = ?, notes = ?, updatedAt = ?
     WHERE id = ?`,
    input.name,
    input.phone,
    input.unit,
    input.rentAmount,
    input.rentDueDay,
    input.reminderHour,
    input.reminderMinute ?? 0,
    input.notes,
    updatedAt,
    id,
  );
}

export async function updateTenantNotification(id: string, notificationId: string | null) {
  const database = await getDatabase();

  await database.runAsync(
    'UPDATE tenants SET notificationId = ?, updatedAt = ? WHERE id = ?',
    notificationId,
    toIsoNow(),
    id,
  );
}

export async function toggleTenantStatus(tenant: Tenant) {
  const database = await getDatabase();
  const nextStatus = tenant.status === 'active' ? 'inactive' : 'active';

  await database.runAsync(
    'UPDATE tenants SET status = ?, notificationId = NULL, updatedAt = ? WHERE id = ?',
    nextStatus,
    toIsoNow(),
    tenant.id,
  );
}

export async function deleteTenant(id: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM tenants WHERE id = ?', id);
}

export async function replaceTenants(tenants: Tenant[]) {
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM tenants');

    for (const tenant of tenants) {
      await database.runAsync(
        `INSERT INTO tenants (
          id, name, phone, unit, rentAmount, rentDueDay, reminderHour, reminderMinute, notes, status,
          notificationId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        tenant.id,
        tenant.name,
        tenant.phone,
        tenant.unit,
        tenant.rentAmount,
        tenant.rentDueDay,
        tenant.reminderHour,
        tenant.reminderMinute ?? 0,
        tenant.notes,
        tenant.status,
        tenant.notificationId,
        tenant.createdAt,
        tenant.updatedAt,
      );
    }
  });
}
