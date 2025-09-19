import { isEmail } from "validator";
interface ValidateAuthDataResult {
  error: string | null;
  success: boolean;
}
export const validateAuthData = (
  email: string,
  password: string,
  confirmPassword?: string
): ValidateAuthDataResult => {
  if (
    !email ||
    !password ||
    (confirmPassword !== undefined && !confirmPassword)
  ) {
    return { error: "All fields are required", success: false };
  }
  if (!isEmail(email)) {
    return { error: "Invalid email format", success: false };
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { error: "Passwords do not match", success: false };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters", success: false };
  }
  return { error: null, success: true };
};
