import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary if keys are defined
const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.log('--- CLOUDINARY NOT CONFIGURED: Falling back to local static serving ---');
}

export const uploadFile = async (filePath, folder = 'studyverse') => {
  try {
    if (isConfigured) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto',
      });
      // Delete temporary local file
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting temp upload file:', err);
      }
      return result.secure_url;
    } else {
      // Return local static path for static server mount
      // e.g. /uploads/filename.ext
      const filename = filePath.split(/[\\/]/).pop();
      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.error('File upload service error:', error);
    throw error;
  }
};
