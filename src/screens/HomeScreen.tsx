import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  FAB,
  Provider as PaperProvider,
  Snackbar,
  Text,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { TenantCard } from '../components/TenantCard';
import { TenantForm } from '../components/TenantForm';
import {
  createTenant,
  deleteTenant,
  listTenants,
  toggleTenantStatus,
  updateTenant,
} from '../data/tenantRepository';
import { exportBackup, importBackup } from '../services/backupService';
import { cancelTenantReminder, scheduleTenantReminder } from '../services/notificationService';
import type { Tenant, TenantInput } from '../types/tenant';
import { buildCallUrl, buildWhatsAppUrl, getPhoneDigits } from '../utils/contact';
import { formatCurrency } from '../utils/date';

type PaperIconName = keyof typeof MaterialCommunityIcons.glyphMap;

const paperIconSettings = {
  icon: ({ color, name, size, testID }: { color?: string; name: string; size: number; testID?: string }) => (
    <MaterialCommunityIcons color={color} name={name as PaperIconName} size={size} testID={testID} />
  ),
};

export function HomeScreen() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackStyle, setSnackStyle] = useState(styles.successSnack);

  const activeTenants = useMemo(
    () => tenants.filter((tenant) => tenant.status === 'active'),
    [tenants],
  );
  const monthlyRent = useMemo(
    () => activeTenants.reduce((total, tenant) => total + tenant.rentAmount, 0),
    [activeTenants],
  );

  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    const storedTenants = await listTenants();
    setTenants(storedTenants);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  function openCreateForm() {
    setSelectedTenant(null);
    setIsFormVisible(true);
  }

  function openEditForm(tenant: Tenant) {
    setSelectedTenant(tenant);
    setIsFormVisible(true);
  }

  async function handleSubmit(input: TenantInput) {
    let savedTenant: Tenant;

    if (selectedTenant) {
      await updateTenant(selectedTenant.id, input);
      await cancelTenantReminder(selectedTenant);
      savedTenant = { ...selectedTenant, ...input, updatedAt: new Date().toISOString() };
    } else {
      savedTenant = await createTenant(input);
    }

    const notificationId = await scheduleTenantReminder(savedTenant);

    setIsFormVisible(false);
    setSelectedTenant(null);
    await loadTenants();

    setSnackMessage(
      notificationId
        ? `Tenant saved and reminder scheduled for ${savedTenant.rentDueDay} at ${savedTenant.reminderHour.toString().padStart(2, '0')}:${(savedTenant.reminderMinute ?? 0).toString().padStart(2, '0')}.`
        : 'Tenant saved. Enable notifications to schedule reminders.',
    );
    setSnackVisible(true);
  }

  async function handleWhatsApp(tenant: Tenant) {
    const phoneDigits = getPhoneDigits(tenant.phone);

    if (!phoneDigits) {
      Alert.alert('Phone number missing', 'Add a tenant phone number before sending WhatsApp.');
      return;
    }

    await Linking.openURL(buildWhatsAppUrl(tenant));
  }

  async function handleCall(tenant: Tenant) {
    const phoneDigits = getPhoneDigits(tenant.phone);

    if (!phoneDigits) {
      Alert.alert('Phone number missing', 'Add a tenant phone number before calling.');
      return;
    }

    await Linking.openURL(buildCallUrl(tenant.phone));
  }

  function handleDelete(tenant: Tenant) {
    Alert.alert('Delete tenant?', `Remove ${tenant.name} and cancel their reminder?`, [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: async () => {
          await cancelTenantReminder(tenant);
          await deleteTenant(tenant.id);
          await loadTenants();
        },
        style: 'destructive',
        text: 'Delete',
      },
    ]);
  }

  async function handleToggleStatus(tenant: Tenant) {
    const willActivate = tenant.status !== 'active';
    const nextTenant = { ...tenant, status: willActivate ? 'active' : 'inactive' } as Tenant;

    await cancelTenantReminder(tenant);
    await toggleTenantStatus(tenant);

    if (willActivate) {
      await scheduleTenantReminder(nextTenant);
    }

    await loadTenants();

    setSnackMessage(
      willActivate
        ? 'Tenant activated and reminder scheduled.'
        : 'Tenant deactivated and reminder cancelled.',
    );
    setSnackStyle(willActivate ? styles.successSnack : styles.errorSnack);
    setSnackVisible(true);
  }

  async function handleExport() {
    const uri = await exportBackup();
    Alert.alert('Backup ready', `Backup file created: ${uri}`);
  }

  async function handleImport() {
    try {
      const imported = await importBackup();

      if (imported) {
        await loadTenants();
        Alert.alert('Backup imported', 'Tenant data was restored on this device.');
      }
    } catch (error) {
      Alert.alert('Import failed', error instanceof Error ? error.message : 'Invalid backup file.');
    }
  }

  return (
    <PaperProvider settings={paperIconSettings}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <Appbar.Header mode="small">
            <Appbar.Content title="Rent reminders" />
            <Appbar.Action icon="upload" onPress={handleImport} />
            <Appbar.Action icon="download" onPress={handleExport} />
          </Appbar.Header>

          <View style={styles.summary}>
            <Text variant="titleMedium">Personal landlord dashboard</Text>
            <Text>{activeTenants.length} active tenants</Text>
            <Text variant="headlineSmall">{formatCurrency(monthlyRent)} / month</Text>
            <Button mode="contained-tonal" onPress={openCreateForm}>
              Add tenant
            </Button>
          </View>

          <FlatList
            contentContainerStyle={styles.list}
            data={tenants}
            keyExtractor={(tenant) => tenant.id}
            ListEmptyComponent={!isLoading ? <EmptyState onAddTenant={openCreateForm} /> : null}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadTenants} />}
            renderItem={({ item }) => (
              <TenantCard
                tenant={item}
                onCall={handleCall}
                onDelete={handleDelete}
                onEdit={openEditForm}
                onToggleStatus={handleToggleStatus}
                onWhatsApp={handleWhatsApp}
              />
            )}
          />

          <FAB icon="plus" style={styles.fab} onPress={openCreateForm} />
          <TenantForm
            tenant={selectedTenant}
            visible={isFormVisible}
            onDismiss={() => setIsFormVisible(false)}
            onSubmitError={(message) => Alert.alert('Save failed', message)}
            onSubmit={handleSubmit}
          />
          <Snackbar
            action={{ label: 'Close', onPress: () => setSnackVisible(false) }}
            duration={2000}
            onDismiss={() => setSnackVisible(false)}
            style={snackStyle}
            visible={snackVisible}
          >
            {snackMessage}
          </Snackbar>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  fab: {
    bottom: 24,
    position: 'absolute',
    right: 24,
  },
  list: {
    padding: 16,
    paddingBottom: 96,
  },
  successSnack: {
    backgroundColor: '#2e7d32',
  },
  errorSnack: {
    backgroundColor: '#c62828',
  },
  safeArea: {
    backgroundColor: '#fffbfe',
    flex: 1,
  },
  summary: {
    gap: 6,
    padding: 16,
  },
});
