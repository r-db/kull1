import * as FileSystem from 'expo-file-system';
import { api } from './api';

const QUEUE_DIR = `${FileSystem.Paths.document}/catch-queue/`;
const QUEUE_INDEX = `${QUEUE_DIR}index.json`;

export interface QueuedCatch {
  id: string;
  tournamentId: string;
  lat: number;
  lng: number;
  photoUri: string;
  lengthIn?: string;
  weightOz?: string;
  species?: string;
  capturedAt: string; // ISO timestamp from when photo was taken
  synced: boolean;
  syncError?: string;
}

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(QUEUE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(QUEUE_DIR, { intermediates: true });
  }
}

async function loadIndex(): Promise<QueuedCatch[]> {
  await ensureDir();
  const info = await FileSystem.getInfoAsync(QUEUE_INDEX);
  if (!info.exists) return [];
  const raw = await FileSystem.readAsStringAsync(QUEUE_INDEX);
  return JSON.parse(raw);
}

async function saveIndex(queue: QueuedCatch[]) {
  await ensureDir();
  await FileSystem.writeAsStringAsync(QUEUE_INDEX, JSON.stringify(queue));
}

/**
 * Queue a catch for later sync. Copies the photo to the queue directory
 * so it persists even if the camera's temp file is cleaned up.
 */
export async function queueCatch(catch_: Omit<QueuedCatch, 'id' | 'synced'>): Promise<QueuedCatch> {
  const id = `catch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Copy photo to persistent location
  const photoFilename = `${id}.jpg`;
  const persistedUri = `${QUEUE_DIR}${photoFilename}`;
  await FileSystem.copyAsync({ from: catch_.photoUri, to: persistedUri });

  const queued: QueuedCatch = {
    ...catch_,
    id,
    photoUri: persistedUri,
    synced: false,
  };

  const queue = await loadIndex();
  queue.push(queued);
  await saveIndex(queue);

  return queued;
}

/**
 * Attempt to sync all unsynced catches. Call this when connectivity returns.
 */
export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await loadIndex();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.synced) continue;

    try {
      const formData = new FormData();
      formData.append('tournament_id', item.tournamentId);
      formData.append('lat', item.lat.toString());
      formData.append('lng', item.lng.toString());
      if (item.lengthIn) formData.append('length_in', item.lengthIn);
      if (item.weightOz) formData.append('weight_oz', item.weightOz);
      if (item.species) formData.append('species', item.species);

      // Attach photo
      formData.append('photo', {
        uri: item.photoUri,
        type: 'image/jpeg',
        name: `${item.id}.jpg`,
      } as any);

      await api('/api/catches/submit', { method: 'POST', body: formData });

      item.synced = true;
      synced++;
    } catch (err: any) {
      item.syncError = err.message;
      failed++;
    }
  }

  await saveIndex(queue);
  return { synced, failed };
}

/**
 * Get all queued catches (synced and unsynced).
 */
export async function getQueue(): Promise<QueuedCatch[]> {
  return loadIndex();
}

/**
 * Get count of unsynced catches waiting.
 */
export async function getPendingCount(): Promise<number> {
  const queue = await loadIndex();
  return queue.filter(c => !c.synced).length;
}

/**
 * Clean up synced catches older than 24 hours.
 */
export async function cleanSynced() {
  const queue = await loadIndex();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const kept: QueuedCatch[] = [];

  for (const item of queue) {
    if (item.synced && new Date(item.capturedAt).getTime() < cutoff) {
      // Delete the photo file
      try { await FileSystem.deleteAsync(item.photoUri, { idempotent: true }); } catch {}
    } else {
      kept.push(item);
    }
  }

  await saveIndex(kept);
}
