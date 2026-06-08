import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * TODO: Call this when an admin uploads a product image.
 * Accepts a file buffer or local path and returns the secure CDN URL.
 */
export async function uploadProductImage(
  _fileBuffer: Buffer,
  _folder = 'products'
): Promise<string> {
  // TODO: Replace with real Cloudinary upload
  // Example:
  // const result = await cloudinary.uploader.upload_stream(
  //   { folder, resource_type: 'image' },
  //   (err, result) => { if (err) throw err; return result; }
  // );
  throw new Error('TODO: Cloudinary upload not yet implemented');
}

export async function deleteProductImage(publicId: string): Promise<void> {
  // TODO: Uncomment when Cloudinary is configured
  // await cloudinary.uploader.destroy(publicId);
  console.log(`TODO: delete image ${publicId} from Cloudinary`);
}
