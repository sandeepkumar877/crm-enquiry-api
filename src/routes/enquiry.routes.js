const express = require("express");
const { body, param } = require("express-validator");
const {
  createPublicEnquiry,
  getUnclaimedEnquiries,
  claimEnquiry,
  getMyEnquiries
} = require("../controllers/enquiry.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

// Public route: no JWT required.
router.post("/", [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters."),
  body("email").trim().isEmail().withMessage("A valid email is required."),
  body("phone").optional().isString().isLength({ max: 25 }).withMessage("Phone must be 25 characters or fewer."),
  body("courseInterest").trim().isLength({ min: 2, max: 120 }).withMessage("Course interest is required."),
  body("message").optional().isString().isLength({ max: 2000 }).withMessage("Message must be 2000 characters or fewer."),
  body("source").optional().isString().isLength({ max: 100 }).withMessage("Source must be 100 characters or fewer.")
], validate, createPublicEnquiry);

// Protected counselor routes.
router.get("/unclaimed", protect, getUnclaimedEnquiries);
router.get("/mine", protect, getMyEnquiries);
router.patch("/:id/claim", [
  protect,
  param("id").isMongoId().withMessage("A valid enquiry ID is required.")
], validate, claimEnquiry);

module.exports = router;