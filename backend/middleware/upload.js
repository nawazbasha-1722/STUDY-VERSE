import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = './uploads';

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter (Optional - we want to allow pdf, docx, ppt, images)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.pptx', '.ppt', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Supported extensions: ${allowedExtensions.join(', ')}`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB file size limit
});
