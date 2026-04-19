import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { vehicleUploadConfig } from './config/file-upload.config';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const heicConvert = require('heic-convert');

const HEIC_MIMES = ['image/heic', 'image/heif'];
const HEIC_EXTS = ['.heic', '.heif'];

export type VehicleFileKind =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'vehicle-license';

@Injectable()
export class VehicleFileUploadService {
  private readonly logger = new Logger(VehicleFileUploadService.name);

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists() {
    const uploadDir = path.resolve(vehicleUploadConfig.uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  validateFile(file: Express.Multer.File, kind: VehicleFileKind) {
    if (file.size > vehicleUploadConfig.maxFileSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${vehicleUploadConfig.maxFileSize / (1024 * 1024)}MB`,
      );
    }
    if (!vehicleUploadConfig.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type for ${kind}. Allowed: JPEG, PNG, PDF`,
      );
    }
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!vehicleUploadConfig.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file extension for ${kind}. Allowed: ${vehicleUploadConfig.allowedExtensions.join(', ')}`,
      );
    }
  }

  private isHeic(file: Express.Multer.File): boolean {
    const ext = path.extname(file.originalname).toLowerCase();
    return HEIC_MIMES.includes(file.mimetype) || HEIC_EXTS.includes(ext);
  }

  private async convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
    return Buffer.from(
      await heicConvert({ buffer, format: 'JPEG', quality: 0.9 }),
    );
  }

  async saveFile(file: Express.Multer.File, kind: VehicleFileKind) {
    this.validateFile(file, kind);

    let buffer = file.buffer;
    let originalName = file.originalname;

    // Convert HEIC/HEIF to JPEG for browser compatibility
    if (this.isHeic(file)) {
      this.logger.log(`Converting HEIC file to JPEG: ${file.originalname}`);
      buffer = await this.convertHeicToJpeg(buffer);
      originalName = originalName
        .replace(/\.heic$/i, '.jpg')
        .replace(/\.heif$/i, '.jpg');
    }

    const secureFileName = vehicleUploadConfig.generateFileName(
      kind,
      originalName,
    );
    const filePath = path.join(vehicleUploadConfig.uploadPath, secureFileName);
    try {
      await fs.promises.writeFile(filePath, buffer);
      return `uploads/vehicles/${secureFileName}`;
    } catch {
      throw new BadRequestException('Failed to save file');
    }
  }
}
