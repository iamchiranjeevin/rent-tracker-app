import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, IconButton, Menu, Text } from 'react-native-paper';

import type { Tenant } from '../types/tenant';
import { formatCurrency } from '../utils/date';

interface TenantCardProps {
  tenant: Tenant;
  onCall: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onToggleStatus: (tenant: Tenant) => void;
  onWhatsApp: (tenant: Tenant) => void;
}

export function TenantCard({
  tenant,
  onCall,
  onDelete,
  onEdit,
  onToggleStatus,
  onWhatsApp,
}: TenantCardProps) {
  const isActive = tenant.status === 'active';
  const [menuVisible, setMenuVisible] = useState(false);

  const closeMenu = () => setMenuVisible(false);
  const openMenu = () => setMenuVisible(true);

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Title
        right={(props) => (
          <View style={styles.headerActions}>
            <Menu
              anchor={<IconButton {...props} icon="dots-vertical" onPress={openMenu} />}
              onDismiss={closeMenu}
              visible={menuVisible}
            >
              <Menu.Item
                disabled={!tenant.phone}
                onPress={() => {
                  onWhatsApp(tenant);
                  closeMenu();
                }}
                title="WhatsApp"
              />
              <Menu.Item
                disabled={!tenant.phone}
                onPress={() => {
                  onCall(tenant);
                  closeMenu();
                }}
                title="Call"
              />
              <Menu.Item
                onPress={() => {
                  onDelete(tenant);
                  closeMenu();
                }}
                title="Delete"
                titleStyle={{ color: '#b3261e' }}
              />
            </Menu>
            <IconButton {...props} icon="pencil" onPress={() => onEdit(tenant)} />
          </View>
        )}
        subtitle={tenant.unit || 'No unit added'}
        title={tenant.name}
      />
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <Text variant="titleMedium">{formatCurrency(tenant.rentAmount)}</Text>
          <Chip
            compact
            icon={isActive ? 'bell' : 'bell-off'}
            onPress={() => onToggleStatus(tenant)}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Chip>
        </View>
        <Text>Due every month on day {tenant.rentDueDay}</Text>
        <Text>
          Reminder every {tenant.reminderHour.toString().padStart(2, '0')}:{(tenant.reminderMinute ?? 0).toString().padStart(2, '0')} until marked paid
        </Text>
        {tenant.phone ? <Text>Phone: {tenant.phone}</Text> : null}
        {tenant.notes ? <Text style={styles.notes}>{tenant.notes}</Text> : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    gap: 6,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  notes: {
    opacity: 0.7,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
