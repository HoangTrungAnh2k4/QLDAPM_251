export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export function validateLogin(email: string) {
    const errors: { email?: string; password?: string } = {};
    if (!isValidEmail(email)) {
        errors.email = 'Email không đúng định dạng';
    }

    return errors;
}
