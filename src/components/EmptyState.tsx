import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

interface EmptyStateProps {
  onAddTenant: () => void;
}

export function EmptyState({ onAddTenant }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">No tenants yet</Text>
      <Text style={styles.copy}>
        Add a tenant, rent amount, and monthly due day. Reminders stay local on this device.
      </Text>
      <Button mode="contained" onPress={onAddTenant}>
        Add first tenant
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  copy: {
    textAlign: 'center',
  },
});
