import { UserInput } from "../resolvers/UserInput";
import { emailRegex } from "./emailRegex";
import { FieldError } from "./FieldError";

export const validateRegister = (options: UserInput) => {
  let errors: FieldError[] = [];
  if (options.username.length < 3) {
    errors.push({
      field: "username",
      message: "username length must be greater than 2",
    });
  }

  if (options.username.includes("@")) {
    errors.push({
      field: "username",
      message: "username cannot include an @",
    });
  }

  errors.concat(validatePassword(options.password));

  if (!options.email.match(emailRegex)) {
    errors.push({
      field: "email",
      message: "invalid email",
    });
  }
  return errors;
};

export const validatePassword = (
  password: string,
  field = "password",
  messageField = false
) => {
  let error: FieldError[] = [];
  let message = "";
  if (password.length < 3) {
    if (messageField) message += `${field} `;
    error = [
      {
        field,
        message: message + "length must be greater than 2",
      },
    ];
  }
  return error;
};
