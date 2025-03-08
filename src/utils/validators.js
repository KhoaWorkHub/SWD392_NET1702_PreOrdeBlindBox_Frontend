/**
 * Email validation regex
 * @type {RegExp}
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Password validation regex (at least 8 characters, including letters, numbers, and special characters)
 * @type {RegExp}
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * Validate login form
 * @param {Object} values - Form values
 * @param {string} values.email - Email address
 * @param {string} values.password - Password
 * @returns {Object} Validation errors
 */
export const validateLoginForm = (values) => {
  const errors = {};

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'The email format is incorrect';
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (!PASSWORD_REGEX.test(values.password)) {
    errors.password = 'The password must be at least 8 characters, including letters, numbers, and special characters';
  }

  return errors;
};

export default {
  validateLoginForm,
};