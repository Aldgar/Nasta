import * as path from 'path';

const baseUploads =
  process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

export const vehicleUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB per file
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp',
    'application/pdf',
  ],
  allowedExtensions: [
    '.jpg',
    '.jpeg',
    '.png',
    '.heic',
    '.heif',
    '.webp',
    '.pdf',
  ],
  uploadPath: path.join(baseUploads, 'vehicles'),
  generateFileName: (prefix: string, originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = originalName.split('.').pop();
    return `${prefix}-${timestamp}-${randomString}.${extension}`;
  },
};
