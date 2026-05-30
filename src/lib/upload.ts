export const MAX_FOTO_SIZE = 2 * 1024 * 1024; // 2MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    return "Format foto harus JPG, PNG, WEBP, atau GIF";
  }
  if (file.size > MAX_FOTO_SIZE) {
    return "Ukuran foto maksimal 2MB";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
