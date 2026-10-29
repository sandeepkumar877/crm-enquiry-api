const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

router.post("/register", [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters."),
  body("email").trim().isEmail().withMessage("A valid email is required."),
  body("password").isString().isLength({ min: 8, max: 128 }).withMessage("Password must be at least 8 characters.")
], validate, register);

router.post("/login", [
  body("email").trim().isEmail().withMessage("A valid email is required."),
  body("password").isString().notEmpty().withMessage("Password is required.")
], validate, login);

module.exports = router;