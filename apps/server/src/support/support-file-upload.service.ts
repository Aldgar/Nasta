import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { supportUploadConfig } from './config/file-upload.config';

@Injectable()
export class SupportFileUploadService {
  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists() {
    const uploadDir = path.resolve(supportUploadConfig.uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Missing file');
    }

    if (file.size > supportUploadConfig.maxFileSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${supportUploadConfig.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    if (!supportUploadConfig.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: Images, PDF, DOC/DOCX, XLS/XLSX, TXT',
      );
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    this.validateFile(file);
    const filename = supportUploadConfig.generateFileName(file.originalname);
    const filePath = path.join(supportUploadConfig.uploadPath, filename);
    try {
      await fs.promises.writeFile(filePath, file.buffer);
      return `uploads/support/${filename}`;
    } catch {
      throw new BadRequestException('Failed to save file');
    }
  }
}
