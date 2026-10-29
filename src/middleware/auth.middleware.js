const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Send Authorization: Bearer <token>."
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findById(payload.sub).select("_id name email role");

    if (!employee) {
      return res.status(401).json({ success: false, message: "Employee account not found." });
    }

    req.employee = employee;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
    next(error);
  }
}

module.exports = { protect };