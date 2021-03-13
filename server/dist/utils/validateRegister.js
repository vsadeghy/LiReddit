"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.validateRegister = void 0;
const emailRegex_1 = require("./emailRegex");
const validateRegister = (options) => {
    let errors = [];
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
    errors.concat(exports.validatePassword(options.password));
    if (!options.email.match(emailRegex_1.emailRegex)) {
        errors.push({
            field: "email",
            message: "invalid email",
        });
    }
    return errors;
};
exports.validateRegister = validateRegister;
const validatePassword = (password, field = "password", messageField = false) => {
    let error = [];
    let message = "";
    if (password.length < 3) {
        if (messageField)
            message += `${field} `;
        error = [
            {
                field,
                message: message + "length must be greater than 2",
            },
        ];
    }
    return error;
};
exports.validatePassword = validatePassword;
//# sourceMappingURL=validateRegister.js.map