const mockRunAsync = jest.fn();
const mockGetAllAsync = jest.fn();
const mockGetFirstAsync = jest.fn(async () => ({ user_version: 1 }));
const mockExecAsync = jest.fn();
const mockWithTransactionAsync = jest.fn(async (callback: () => Promise<void>) => callback());

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: mockExecAsync,
    getAllAsync: mockGetAllAsync,
    getFirstAsync: mockGetFirstAsync,
    runAsync: mockRunAsync,
    withTransactionAsync: mockWithTransactionAsync,
  })),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'tenant-id-1'),
}));

import { createTenant, listTenants, replaceTenants } from '../src/data/tenantRepository';

describe('tenant repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllAsync.mockResolvedValue([]);
  });

  test('creates tenant row in local SQLite', async () => {
    const tenant = await createTenant({
      name: 'Ravi',
      notes: 'Pays online',
      phone: '9876543210',
      reminderHour: 9,
      reminderMinute: 30,
      rentAmount: 15000,
      rentDueDay: 5,
      unit: 'A-101',
    });

    expect(tenant.id).toBe('tenant-id-1');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO tenants'),
      'tenant-id-1',
      'Ravi',
      '9876543210',
      'A-101',
      15000,
      5,
      9,
      30,
      'Pays online',
      'active',
      null,
      expect.any(String),
      expect.any(String),
    );
  });

  test('lists tenants ordered for dashboard display', async () => {
    await listTenants();

    expect(mockGetAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM tenants ORDER BY status ASC, rentDueDay ASC, name COLLATE NOCASE ASC',
    );
  });

  test('import backup replaces stored tenants inside transaction', async () => {
    await replaceTenants([
      {
        createdAt: '2026-06-08T00:00:00.000Z',
        id: 'tenant-id-2',
        name: 'Sita',
        notes: '',
        notificationId: null,
        phone: '',
        reminderHour: 10,
        reminderMinute: 15,
        rentAmount: 12000,
        rentDueDay: 3,
        status: 'active',
        unit: 'B-202',
        updatedAt: '2026-06-08T00:00:00.000Z',
      },
    ]);

    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync).toHaveBeenCalledWith('DELETE FROM tenants');
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO tenants'),
      'tenant-id-2',
      'Sita',
      '',
      'B-202',
      12000,
      3,
      10,
      15,
      '',
      'active',
      null,
      '2026-06-08T00:00:00.000Z',
      '2026-06-08T00:00:00.000Z',
    );
  });
});
