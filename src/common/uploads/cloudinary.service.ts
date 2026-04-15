import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { UploadApiOptions, v2 as cloudinary } from 'cloudinary';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  private ensureCloudinaryConfig() {
    const requiredKeys = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ];
    const missing = requiredKeys.filter((key) => !process.env[key]?.trim());

    if (missing.length) {
      throw new ServiceUnavailableException(
        `Cloudinary sozlanmagan. Yetishmayotgan env: ${missing.join(', ')}`,
      );
    }
  }

  uploadFile(
    file: Express.Multer.File,
    options: UploadApiOptions = {},
  ): Promise<any> {
    this.ensureCloudinaryConfig();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          timeout: 30_000,
          ...options,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
