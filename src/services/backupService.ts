import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { listTenants, replaceTenants } from '../data/tenantRepository';
import type { BackupPayload } from '../types/tenant';

export async function exportBackup() {
  const tenants = await listTenants();
  const exportedAt = new Date().toISOString();
  const payload: BackupPayload = {
    app: 'rent-reminder-app',
    exportedAt,
    tenants,
    version: 1,
  };
  const file = new File(Paths.cache, `rent-reminder-backup-${exportedAt.slice(0, 10)}.json`);

  file.write(JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      dialogTitle: 'Save rent reminder backup',
      mimeType: 'application/json',
    });
  }

  return file.uri;
}

export async function importBackup() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: 'application/json',
  });

  if (result.canceled) {
    return false;
  }

  const file = new File(result.assets[0].uri);
  const rawBackup = await file.text();
  const backup = JSON.parse(rawBackup) as BackupPayload;

  if (backup.app !== 'rent-reminder-app' || backup.version !== 1 || !Array.isArray(backup.tenants)) {
    throw new Error('Invalid rent reminder backup file.');
  }

  await replaceTenants(backup.tenants);
  return true;
}
