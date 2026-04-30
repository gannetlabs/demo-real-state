import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { platforms } from "@/data/platforms";
import type { ContentPlatform } from "@/types/content";

let cachedClient: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

function getBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "propia-generated-images";
}

export async function uploadGeneratedImage(
  buffer: Buffer,
  path: string,
  contentType = "image/jpeg"
): Promise<string> {
  const client = getClient();
  const bucket = getBucket();

  const { error } = await client.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Supabase upload failed for ${path}: ${error.message}`);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

let cachedDemoImages: Record<ContentPlatform, string> | null = null;

const LIST_OPTIONS = {
  limit: 100,
  sortBy: { column: "created_at", order: "desc" as const },
};

async function findLatestCompleteSetFolder(): Promise<string | null> {
  const client = getClient();
  const bucket = getBucket();
  const expected = new Set(platforms.map((p) => `${p.id}.jpg`));

  const { data: roots, error: rootsErr } = await client.storage
    .from(bucket)
    .list("", LIST_OPTIONS);
  if (rootsErr) throw new Error(`Supabase list root failed: ${rootsErr.message}`);
  if (!roots?.length) return null;

  for (const root of roots) {
    if (!root.name) continue;
    const { data: timestamps } = await client.storage
      .from(bucket)
      .list(root.name, LIST_OPTIONS);
    if (!timestamps?.length) continue;

    for (const ts of timestamps) {
      if (!ts.name) continue;
      const folder = `${root.name}/${ts.name}`;
      const { data: files } = await client.storage.from(bucket).list(folder, LIST_OPTIONS);
      if (!files?.length) continue;

      const fileNames = new Set(files.map((f) => f.name));
      const complete = [...expected].every((name) => fileNames.has(name));
      if (complete) return folder;
    }
  }

  return null;
}

export async function listLatestDemoImages(): Promise<Record<ContentPlatform, string>> {
  if (cachedDemoImages) return cachedDemoImages;

  const folder = await findLatestCompleteSetFolder();
  if (!folder) throw new Error("No demo image set found in Supabase bucket");

  const client = getClient();
  const bucket = getBucket();
  const map = {} as Record<ContentPlatform, string>;
  for (const p of platforms) {
    const { data } = client.storage.from(bucket).getPublicUrl(`${folder}/${p.id}.jpg`);
    map[p.id] = data.publicUrl;
  }
  cachedDemoImages = map;
  return map;
}

export async function pruneStorageKeepingLatestSet(): Promise<{
  kept: string | null;
  deleted: number;
}> {
  const keep = await findLatestCompleteSetFolder();
  if (!keep) return { kept: null, deleted: 0 };

  const client = getClient();
  const bucket = getBucket();

  const toDelete: string[] = [];

  const { data: roots } = await client.storage.from(bucket).list("", LIST_OPTIONS);
  for (const root of roots ?? []) {
    if (!root.name) continue;
    const { data: timestamps } = await client.storage
      .from(bucket)
      .list(root.name, LIST_OPTIONS);
    for (const ts of timestamps ?? []) {
      if (!ts.name) continue;
      const folder = `${root.name}/${ts.name}`;
      if (folder === keep) continue;
      const { data: files } = await client.storage.from(bucket).list(folder, LIST_OPTIONS);
      for (const file of files ?? []) {
        if (!file.name) continue;
        toDelete.push(`${folder}/${file.name}`);
      }
    }
  }

  if (toDelete.length === 0) {
    cachedDemoImages = null;
    return { kept: keep, deleted: 0 };
  }

  const { error } = await client.storage.from(bucket).remove(toDelete);
  if (error) throw new Error(`Supabase remove failed: ${error.message}`);

  cachedDemoImages = null;
  return { kept: keep, deleted: toDelete.length };
}
