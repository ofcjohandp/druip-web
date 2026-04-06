import { supabase } from '@/lib/supabase';

/**
 * Uploads a file to the classroom-assets Supabase Storage bucket.
 * Returns the storage path (not a URL) — use getSignedUrl to generate read URLs.
 *
 * Per Pitfall 2 in RESEARCH.md: cannot pass fileUri directly to Supabase Storage.
 * Must convert to Blob via fetch() first.
 *
 * Storage path uses classroomId + Date.now() + fileName to avoid enumeration.
 */
export async function uploadClassroomFile(
  classroomId: string,
  fileUri: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  // Convert URI to Blob — cannot pass fileUri directly (Research Pitfall 2)
  const response = await fetch(fileUri);
  const blob = await response.blob();

  // Storage path: not guessable, scoped to classroom
  const storagePath = `${classroomId}/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from('classroom-assets')
    .upload(storagePath, blob, { contentType: mimeType });

  if (error) throw error;

  return storagePath;
}

/**
 * Generates a signed URL for a private classroom-assets file.
 * Expiry: 3600 seconds (1 hour) per D-17 in CONTEXT.md.
 *
 * NEVER use getPublicUrl — bucket is private.
 */
export async function getSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('classroom-assets')
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;

  return data.signedUrl;
}
