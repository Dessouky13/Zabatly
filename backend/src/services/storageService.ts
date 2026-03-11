/**
 * Storage Service — handles file uploads to local disk (VPS).
 * Files are served via Express static or Nginx.
 *
 * STORAGE_DRIVER=local  → writes to STORAGE_LOCAL_PATH (default: /var/www/zabatly/uploads)
 * Public files live at:  {STORAGE_LOCAL_PATH}/public/{bucket}/{path}
 * Private files live at: {STORAGE_LOCAL_PATH}/private/{path}
 */

import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const LOCAL_PATH = process.env.STORAGE_LOCAL_PATH || '/var/www/zabatly/uploads';
const BASE_URL = process.env.STORAGE_BASE_URL || 'https://api.zabatly.com/uploads';

type Bucket = 'moodboard-images' | 'redesign-images' | 'payment-screenshots' | 'avatars';

function isPrivate(bucket: Bucket): boolean {
  return bucket === 'payment-screenshots';
}

function localFilePath(bucket: Bucket, filePath: string): string {
  const visibility = isPrivate(bucket) ? 'private' : 'public';
  return path.join(LOCAL_PATH, visibility, bucket, filePath);
}

function publicUrl(bucket: Bucket, filePath: string): string {
  return `${BASE_URL}/public/${bucket}/${filePath}`;
}

/**
 * Writes a buffer to local disk and returns the public URL (or private path).
 */
export async function uploadFile(
  bucket: Bucket,
  filePath: string,
  buffer: Buffer,
  _mimeType: string
): Promise<string> {
  const dest = localFilePath(bucket, filePath);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buffer);

  if (isPrivate(bucket)) return filePath; // return relative path for private files
  return publicUrl(bucket, filePath);
}

/**
 * Downloads an image from a URL and saves it to local disk.
 * Used to persist DALL-E temporary URLs.
 */
export async function reuploadFromUrl(
  url: string,
  bucket: Bucket,
  filePath: string
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image from URL: ${url}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get('content-type') || 'image/jpeg';

  return uploadFile(bucket, filePath, buffer, mimeType);
}

/**
 * Returns the absolute local path for private files (admin access only).
 */
export function getLocalPath(bucket: Bucket, filePath: string): string {
  return localFilePath(bucket, filePath);
}

/**
 * For API compatibility — returns the private file path as a "signed" URL.
 * In production, replace with a time-limited signed token served by your own endpoint.
 */
export async function getSignedUrl(bucket: Bucket, filePath: string, _expiresIn = 3600): Promise<string> {
  // Serve via GET /api/admin/files/:path protected by admin auth
  return `/api/admin/files/${bucket}/${filePath}`;
}

/**
 * Uploads a mood board image and returns the permanent URL.
 */
export async function uploadMoodBoardImage(
  userId: string,
  boardId: string,
  imageIndex: number,
  tempUrl: string
): Promise<string> {
  const filePath = `${userId}/${boardId}/img_${imageIndex}.jpg`;
  return reuploadFromUrl(tempUrl, 'moodboard-images', filePath);
}

/**
 * Uploads a payment screenshot to the private storage area.
 * Returns the storage path (not a public URL).
 */
export async function uploadPaymentScreenshot(
  userId: string,
  paymentId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const filePath = `${userId}/${paymentId}/screenshot.${ext}`;
  return uploadFile('payment-screenshots', filePath, buffer, mimeType);
}

export { randomUUID };
