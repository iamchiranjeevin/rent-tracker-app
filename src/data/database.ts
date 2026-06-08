import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'rent-reminder.db';
const DATABASE_VERSION = 2;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (database) => {
      await migrateDatabase(database);
      return database;
    });
  }

  return databasePromise;
}

async function migrateDatabase(database: SQLite.SQLiteDatabase) {
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        unit TEXT NOT NULL DEFAULT '',
        rentAmount REAL NOT NULL,
        rentDueDay INTEGER NOT NULL,
        reminderHour INTEGER NOT NULL DEFAULT 9,
        reminderMinute INTEGER NOT NULL DEFAULT 0,
        notes TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        notificationId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
      CREATE INDEX IF NOT EXISTS idx_tenants_due_day ON tenants(rentDueDay);
    `);
  }

  if (currentVersion === 1) {
    await database.execAsync('ALTER TABLE tenants ADD COLUMN reminderMinute INTEGER NOT NULL DEFAULT 0;');
  }

  await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
