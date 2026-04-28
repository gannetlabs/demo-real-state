// One-shot setup: creates the Supabase Storage bucket used by /api/generate-images.
// Run with:  node --env-file=.env.local scripts/create-supabase-bucket.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "propia-generated-images";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const options = {
  public: true,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  fileSizeLimit: 5 * 1024 * 1024, // 5 MB
};

console.log(`Creating bucket "${bucket}" at ${url}`);
const { data, error } = await supabase.storage.createBucket(bucket, options);

if (error) {
  if (/already exists/i.test(error.message)) {
    console.log(`Bucket "${bucket}" already exists, updating settings...`);
    const upd = await supabase.storage.updateBucket(bucket, options);
    if (upd.error) {
      console.error("updateBucket failed:", upd.error.message);
      process.exit(1);
    }
    console.log("Bucket settings updated.");
  } else {
    console.error("createBucket failed:", error.message);
    process.exit(1);
  }
} else {
  console.log("Bucket created:", data);
}

const list = await supabase.storage.listBuckets();
const found = list.data?.find((b) => b.name === bucket);
console.log("Verified:", found ?? "(not found)");
