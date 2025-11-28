import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Upload directory - create if doesn't exist
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const DOCUMENTS_DIR = path.join(UPLOAD_DIR, 'documents');
const LOGOS_DIR = path.join(UPLOAD_DIR, 'logos');

// Ensure directories exist
[UPLOAD_DIR, DOCUMENTS_DIR, LOGOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

export interface UploadedFile {
    filename: string;
    url: string;
    path: string;
}

/**
 * Save uploaded file to disk
 * @param file - Multer file object
 * @param type - Type of document (logo, license, etc.)
 * @returns File information with URL
 */
export async function saveFile(file: Express.Multer.File, type: string): Promise<UploadedFile> {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;

    // Determine subdirectory based on type
    const subDir = type === 'logo' ? LOGOS_DIR : DOCUMENTS_DIR;
    const filePath = path.join(subDir, filename);

    // Save file
    await fs.promises.writeFile(filePath, file.buffer);

    // Generate URL (relative to server)
    const url = `/uploads/${type === 'logo' ? 'logos' : 'documents'}/${filename}`;

    return {
        filename,
        url,
        path: filePath,
    };
}

/**
 * Delete file from disk
 * @param filePath - Full path to file
 */
export async function deleteFile(filePath: string): Promise<void> {
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Failed to delete file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Get full file path from URL
 * @param url - Relative URL (/uploads/documents/xyz.jpg)
 * @returns Full filesystem path
 */
export function getFilePathFromUrl(url: string): string {
    const relativePath = url.replace('/uploads/', '');
    return path.join(UPLOAD_DIR, relativePath);
}

/**
 * Validate file type
 * @param mimetype - File MIME type
 * @returns true if valid
 */
export function isValidFileType(mimetype: string): boolean {
    const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
    ];
    return validTypes.includes(mimetype);
}

/**
 * Validate file size (max 5MB)
 * @param size - File size in bytes
 * @returns true if valid
 */
export function isValidFileSize(size: number): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return size <= maxSize;
}
