import { body, check, query, validationResult } from "express-validator";

const checkPasswordStrength = () =>
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character");

const sanitazeUsername = () => body("username").trim().escape();

const sanitazeEmail = () => body("email").trim().escape().isEmail();
export { checkPasswordStrength, sanitazeUsername, sanitazeEmail };
