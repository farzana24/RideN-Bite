import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { isValidFileType, isValidFileSize } from '../services/storageService';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        if (!isValidFileType(file.mimetype)) {
            cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
            return;
        }
        cb(null, true);
    },
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple files
export const uploadMultiple = upload.array('files', 5); // Max 5 files

// Error handling middleware for file uploads
export function handleUploadError(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 5MB limit',
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 5 files allowed',
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed',
        });
    }

    next();
}
