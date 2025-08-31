import { ImageFileSchema } from '../domain/chat.schema';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_DIMENSIONS = { width: 2048, height: 2048 };

export interface ProcessedImage {
  file: File;
  preview: string;
  isValid: boolean;
  error?: string;
}

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Please upload ${ALLOWED_TYPES.join(', ')}`
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`
    };
  }
  
  return { isValid: true };
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const compressImage = (file: File, maxWidth = MAX_DIMENSIONS.width, maxHeight = MAX_DIMENSIONS.height, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const processImageFile = async (file: File): Promise<ProcessedImage> => {
  const validation = validateImageFile(file);
  
  if (!validation.isValid) {
    return {
      file,
      preview: '',
      isValid: false,
      error: validation.error
    };
  }

  try {
    const preview = await createImagePreview(file);
    
    let processedFile = file;
    if (file.size > MAX_FILE_SIZE / 2) {
      processedFile = await compressImage(file);
    }

    return {
      file: processedFile,
      preview,
      isValid: true
    };
  } catch (error) {
    return {
      file,
      preview: '',
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to process image'
    };
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};