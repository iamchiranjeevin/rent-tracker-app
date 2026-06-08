import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

const mockListTenants = jest.fn();
const mockToggleTenantStatus = jest.fn();
const mockCancelTenantReminder = jest.fn();
const mockScheduleTenantReminder = jest.fn();

jest.mock('../src/data/tenantRepository', () => ({
  createTenant: jest.fn(),
  deleteTenant: jest.fn(),
  listTenants: (...args: unknown[]) => mockListTenants(...args),
  toggleTenantStatus: (...args: unknown[]) => mockToggleTenantStatus(...args),
  updateTenant: jest.fn(),
}));

jest.mock('../src/services/notificationService', () => ({
  cancelTenantReminder: (...args: unknown[]) => mockCancelTenantReminder(...args),
  scheduleTenantReminder: (...args: unknown[]) => mockScheduleTenantReminder(...args),
}));

jest.mock('../src/services/backupService', () => ({
  exportBackup: jest.fn(),
  importBackup: jest.fn(),
}));

jest.mock('../src/components/TenantCard', () => {
  const { Pressable, Text } = require('react-native');

  return {
    TenantCard: ({ tenant, onToggleStatus }: { tenant: { status: string }; onToggleStatus: () => void }) => (
      <Pressable onPress={() => onToggleStatus(tenant)}>
        <Text>{tenant.status === 'active' ? 'Active' : 'Inactive'}</Text>
      </Pressable>
    ),
  };
});

jest.mock('../src/components/TenantForm', () => ({
  TenantForm: () => null,
}));

import { HomeScreen } from '../src/screens/HomeScreen';

describe('<HomeScreen /> status toggle reminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('activates a reminder and shows the green toast message when toggling to active', async () => {
    mockListTenants.mockResolvedValue([
      {
        createdAt: '2026-06-08T00:00:00.000Z',
        id: 'tenant-1',
        name: 'Ravi',
        notes: '',
        notificationId: null,
        phone: '',
        reminderHour: 9,
        reminderMinute: 0,
        rentAmount: 15000,
        rentDueDay: 5,
        status: 'inactive',
        unit: 'A-101',
        updatedAt: '2026-06-08T00:00:00.000Z',
      },
    ]);
    mockScheduleTenantReminder.mockResolvedValue('notif-1');

    const screen = await render(<HomeScreen />);

    await waitFor(() => expect(screen.getByText('Inactive')).toBeTruthy());

    fireEvent.press(screen.getByText('Inactive'));

    await waitFor(() => expect(mockScheduleTenantReminder).toHaveBeenCalledTimes(1));
    expect(mockCancelTenantReminder).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText('Tenant activated and reminder scheduled.')).toBeTruthy());
  });

  test('cancels the reminder and shows the red toast message when toggling to inactive', async () => {
    mockListTenants.mockResolvedValue([
      {
        createdAt: '2026-06-08T00:00:00.000Z',
        id: 'tenant-2',
        name: 'Sita',
        notes: '',
        notificationId: 'notif-2',
        phone: '',
        reminderHour: 10,
        reminderMinute: 30,
        rentAmount: 12000,
        rentDueDay: 3,
        status: 'active',
        unit: 'B-202',
        updatedAt: '2026-06-08T00:00:00.000Z',
      },
    ]);

    const screen = await render(<HomeScreen />);

    await waitFor(() => expect(screen.getByText('Active')).toBeTruthy());

    fireEvent.press(screen.getByText('Active'));

    await waitFor(() => expect(mockCancelTenantReminder).toHaveBeenCalledTimes(1));
    expect(mockScheduleTenantReminder).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText('Tenant deactivated and reminder cancelled.')).toBeTruthy());
  });
});
