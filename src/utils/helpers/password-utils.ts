import { toastService } from "@/lib/toast";

/**
 * Generate a random password with specified length
 * @param length - The length of the password (default: 12)
 * @returns A randomly generated password string
 */
export const generatePassword = (length: number = 12): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let generatedPassword = "";
  for (let i = 0; i < length; i++) {
    generatedPassword += charset.charAt(
      Math.floor(Math.random() * charset.length)
    );
  }
  navigator?.clipboard?.writeText?.(generatedPassword);
  toastService.showSuccess(
    "",
    "Password generated and copied to clipboard successfully!"
  );
  return generatedPassword;
};
