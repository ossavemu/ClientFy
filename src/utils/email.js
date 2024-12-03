import validator from 'email-validator';

export const isValidEmail = (email) => {
  return validator.validate(email);
};
