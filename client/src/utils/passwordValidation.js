export function validatePassword(password) {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/[A-Z]/.test(password)) return "Password must have at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must have at least one number";
  if (!/[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?`~]/.test(password))
    return "Password must have at least one special character";
  return null;
}

export const PASSWORD_HINT =
  "Min. 6 chars · 1 uppercase · 1 number · 1 special character (!@#$%...)";
