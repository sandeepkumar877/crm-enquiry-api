require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const enquiryRoutes = require("./src/routes/enquiry.routes");
const { notFound, errorHandler } = require("./src/middleware/error.middleware");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "CRM Enquiry API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/enquiries", enquiryRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  });