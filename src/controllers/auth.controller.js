const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

function createToken(employee) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in environment variables");
  return jwt.sign(
    { sub: employee._id.toString(), role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Employee.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: "An employee with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const employee = await Employee.create({ name: name.trim(), email: normalizedEmail, passwordHash });

    const token = createToken(employee);
    return res.status(201).json({
      success: true,
      message: "Employee registered successfully.",
      token,
      employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");

    if (!employee || !(await bcrypt.compare(password, employee.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = createToken(employee);
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };