
import DOMPurify from 'dompurify';

// Input validation patterns
export const VALIDATION_PATTERNS = {
  title: /^[a-zA-Z0-9\s\-_.,!?()]{1,100}$/,
  description: /^[a-zA-Z0-9\s\-_.,!?()\n]{0,500}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*$/,
  fileName: /^[a-zA-Z0-9\-_. ]{1,255}$/,
  category: /^[a-zA-Z0-9\s\-_]{1,50}$/,
  time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  name: /^[a-zA-Z\s]{1,50}$/
};

// Allowed file types with MIME types
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  default: 5 * 1024 * 1024 // 5MB
};

// Sanitize HTML content
export const sanitizeHTML = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p'],
    ALLOWED_ATTR: []
  });
};

// Sanitize plain text input
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text.trim().replace(/[<>]/g, '');
};

// Validate input against pattern
export const validateInput = (value: string, pattern: RegExp): boolean => {
  if (!value) return false;
  return pattern.test(value);
};

// Validate email
export const validateEmail = (email: string): boolean => {
  return validateInput(email, VALIDATION_PATTERNS.email);
};

// Validate URL
export const validateURL = (url: string): boolean => {
  if (!url) return true; // Optional field
  return validateInput(url, VALIDATION_PATTERNS.url);
};

// Validate file type
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Validate file size
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// Check file header/magic numbers for basic validation
export const validateFileHeader = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(buffer.slice(0, 4));
      const header = Array.from(uint8Array).map(byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Basic magic number validation
      const validHeaders = [
        'ffd8ff', // JPEG
        '89504e', // PNG
        '47494638', // GIF
        '52494646', // WEBP (RIFF)
        '25504446', // PDF
      ];
      
      const isValid = validHeaders.some(validHeader => header.startsWith(validHeader));
      resolve(isValid);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

// Comprehensive file validation
export const validateFile = async (file: File, allowedTypes: string[], maxSize: number): Promise<{ isValid: boolean; error?: string }> => {
  // Check file name
  if (!validateInput(file.name, VALIDATION_PATTERNS.fileName)) {
    return { isValid: false, error: 'Nome do arquivo contém caracteres inválidos' };
  }
  
  // Check file type
  if (!validateFileType(file, allowedTypes)) {
    return { isValid: false, error: 'Tipo de arquivo não permitido' };
  }
  
  // Check file size
  if (!validateFileSize(file, maxSize)) {
    return { isValid: false, error: `Arquivo muito grande. Máximo permitido: ${(maxSize / 1024 / 1024).toFixed(1)}MB` };
  }
  
  // Check file header
  const hasValidHeader = await validateFileHeader(file);
  if (!hasValidHeader) {
    return { isValid: false, error: 'Arquivo pode estar corrompido ou ser de tipo inválido' };
  }
  
  return { isValid: true };
};

// Rate limiting for form submissions
const submissionTimestamps: Record<string, number[]> = {};

export const checkRateLimit = (key: string, maxSubmissions: number = 10, timeWindow: number = 60000): boolean => {
  const now = Date.now();
  
  if (!submissionTimestamps[key]) {
    submissionTimestamps[key] = [];
  }
  
  // Remove old timestamps outside the time window
  submissionTimestamps[key] = submissionTimestamps[key].filter(timestamp => now - timestamp < timeWindow);
  
  // Check if we've exceeded the limit
  if (submissionTimestamps[key].length >= maxSubmissions) {
    return false;
  }
  
  // Add current timestamp
  submissionTimestamps[key].push(now);
  return true;
};

// Secure data encryption for localStorage (simple XOR encryption)
const ENCRYPTION_KEY = 'tdahfocus-secure-key-2024';

export const encryptData = (data: string): string => {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(encrypted);
};

export const decryptData = (encryptedData: string): string => {
  try {
    const data = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return decrypted;
  } catch {
    return '';
  }
};
