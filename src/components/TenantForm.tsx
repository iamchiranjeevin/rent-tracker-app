import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';

import type { Tenant, TenantInput } from '../types/tenant';
import { clampDueDay } from '../utils/date';
import { normalizeTenantInput, validateTenantInput } from '../utils/tenantInput';

function getDefaultInput(): TenantInput {
  const now = new Date();

  return {
    name: '',
    notes: '',
    phone: '',
    reminderHour: now.getHours(),
    reminderMinute: now.getMinutes(),
    rentAmount: 0,
    rentDueDay: now.getDate(),
    unit: '',
  };
}

interface TenantFormProps {
  tenant: Tenant | null;
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (input: TenantInput) => Promise<void>;
  onSubmitError: (message: string) => void;
}

export function TenantForm({ tenant, visible, onDismiss, onSubmit, onSubmitError }: TenantFormProps) {
  const [form, setForm] = useState<TenantInput>(getDefaultInput());
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name,
        notes: tenant.notes,
        phone: tenant.phone,
        reminderHour: tenant.reminderHour,
        reminderMinute: tenant.reminderMinute ?? 0,
        rentAmount: tenant.rentAmount,
        rentDueDay: tenant.rentDueDay,
        unit: tenant.unit,
      });
    } else {
      setForm(getDefaultInput());
    }
  }, [tenant, visible]);

  async function handleSubmit() {
    const validationError = validateTenantInput(form);

    if (validationError) {
      onSubmitError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      await onSubmit(normalizeTenantInput(form));
    } catch (error) {
      onSubmitError(error instanceof Error ? error.message : 'Unable to save tenant.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <Card.Title title={tenant ? 'Edit tenant' : 'Add tenant'} />
          <Card.Content style={styles.content}>
            <TextInput
              label="Tenant name"
              mode="outlined"
              testID="tenant-name-input"
              value={form.name}
              onChangeText={(name) => setForm((current) => ({ ...current, name }))}
            />
            <TextInput
              label="Unit / flat"
              mode="outlined"
              testID="tenant-unit-input"
              value={form.unit}
              onChangeText={(unit) => setForm((current) => ({ ...current, unit }))}
            />
            <TextInput
              keyboardType="phone-pad"
              label="Phone"
              mode="outlined"
              testID="tenant-phone-input"
              value={form.phone}
              onChangeText={(phone) => setForm((current) => ({ ...current, phone }))}
            />
            <TextInput
              keyboardType="numeric"
              label="Monthly rent amount"
              mode="outlined"
              testID="tenant-rent-input"
              value={String(form.rentAmount || '')}
              onChangeText={(rentAmount) =>
                setForm((current) => ({ ...current, rentAmount: Number(rentAmount) || 0 }))
              }
            />
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowDatePicker(true)}
                style={[styles.pickerButton, styles.rowInput]}
                testID="tenant-reminder-picker"
              >
                <Text variant="bodyMedium">Reminder: {form.reminderHour.toString().padStart(2, '0')}:{(form.reminderMinute ?? 0).toString().padStart(2, '0')}</Text>
                <Text variant="bodySmall">Tap to pick date and time</Text>
              </Pressable>
            </View>
            {showDatePicker ? (
              <DateTimePicker
                display="calendar"
                mode="date"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);

                  if (selectedDate) {
                    setForm((current) => ({
                      ...current,
                      rentDueDay: clampDueDay(selectedDate.getDate()),
                    }));
                    setShowTimePicker(true);
                  }
                }}
                value={new Date(new Date().getFullYear(), new Date().getMonth(), form.rentDueDay)}
              />
            ) : null}
            {showTimePicker ? (
              <DateTimePicker
                display="clock"
                is24Hour={true}
                mode="time"
                onChange={(_, selectedDate) => {
                  setShowTimePicker(false);

                  if (selectedDate) {
                    setForm((current) => ({
                      ...current,
                      reminderHour: selectedDate.getHours(),
                      reminderMinute: selectedDate.getMinutes(),
                    }));
                  }
                }}
                value={new Date(new Date().getFullYear(), new Date().getMonth(), form.rentDueDay, form.reminderHour, form.reminderMinute ?? 0)}
              />
            ) : null}
            <Text variant="bodySmall">Choose the due date and reminder time from the same picker.</Text>
            <TextInput
              label="Notes"
              mode="outlined"
              multiline
              numberOfLines={3}
              testID="tenant-notes-input"
              value={form.notes}
              onChangeText={(notes) => setForm((current) => ({ ...current, notes }))}
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={onDismiss}>Cancel</Button>
            <Button disabled={isSaving} loading={isSaving} mode="contained" onPress={handleSubmit}>
              Save
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f2fa',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowInput: {
    flex: 1,
  },
  pickerButton: {
    borderColor: '#c4b5fd',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
