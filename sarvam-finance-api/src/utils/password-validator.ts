import bcrypt from 'bcryptjs';

// Top common passwords (abbreviated list — covers the most critical ones)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', '123456789', '1234567890',
  'qwerty', 'abc123', 'password1', 'iloveyou', 'admin',
  'welcome', 'monkey', 'dragon', 'master', 'login',
  'princess', 'football', 'shadow', 'sunshine', 'trustno1',
  'letmein', 'passw0rd', 'baseball', 'michael', 'superman',
  'batman', 'access', 'hello', 'charlie', 'donald',
  'password123', 'admin123', 'root', 'toor', 'pass',
  'test', 'guest', 'changeme', 'default', 'qwerty123',
  'password1234', '12341234', 'aaaaaa', '111111', '000000',
  '654321', 'zxcvbnm', 'asdfghjkl', 'qwertyuiop',
]);

// Sequential character patterns
const SEQUENTIAL_PATTERNS = [
  'abcdefghijklmnopqrstuvwxyz',
  'zyxwvutsrqponmlkjihgfedcba',
  '0123456789',
  '9876543210',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
];

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string, email: string): PasswordValidationResult {
  const errors: string[] = [];

  // 1. Minimum 12 characters
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  // 2. At least 1 uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // 3. At least 1 lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // 4. At least 1 number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // 5. At least 1 special character
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // 6. No username/email in password
  const emailLocal = email.split('@')[0].toLowerCase();
  if (password.toLowerCase().includes(emailLocal) && emailLocal.length > 2) {
    errors.push('Password must not contain your email or username');
  }

  // 7. No common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a more unique password');
  }

  // 8. No sequential characters (3+ in a row)
  const lowerPass = password.toLowerCase();
  for (const pattern of SEQUENTIAL_PATTERNS) {
    for (let i = 0; i <= pattern.length - 3; i++) {
      if (lowerPass.includes(pattern.substring(i, i + 3))) {
        errors.push('Password must not contain sequential characters (e.g., abc, 123)');
        break;
      }
    }
    if (errors.length > 0 && errors[errors.length - 1].includes('sequential')) break;
  }

  // 9. No repeated characters (3+ same char in a row)
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password must not contain 3 or more repeated characters (e.g., aaa, 111)');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if password was previously used (last 5 passwords)
 */
export async function checkPasswordHistory(
  password: string,
  passwordHashes: string[]
): Promise<boolean> {
  for (const hash of passwordHashes) {
    const match = await bcrypt.compare(password, hash);
    if (match) return true; // password was previously used
  }
  return false;
}
