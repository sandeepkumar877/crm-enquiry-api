const Enquiry = require("../models/Enquiry");

async function createPublicEnquiry(req, res, next) {
  try {
    const { name, email, phone = "", courseInterest, message = "", source = "public-form" } = req.body;
    const enquiry = await Enquiry.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      courseInterest: courseInterest.trim(),
      message: message.trim(),
      source: source.trim(),
      status: "unclaimed",
      assignedTo: null
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      enquiry
    });
  } catch (error) {
    next(error);
  }
}

// Only unclaimed enquiries are returned. Any authenticated counselor can see them.
async function getUnclaimedEnquiries(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const [enquiries, total] = await Promise.all([
      Enquiry.find({ status: "unclaimed", assignedTo: null })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments({ status: "unclaimed", assignedTo: null })
    ]);

    res.status(200).json({
      success: true,
      data: enquiries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
}

// Atomic conditional update means only one counselor can claim a lead successfully.
async function claimEnquiry(req, res, next) {
  try {
    const enquiry = await Enquiry.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "unclaimed",
        assignedTo: null
      },
      {
        $set: {
          status: "claimed",
          assignedTo: req.employee._id,
          claimedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).populate("assignedTo", "name email");

    if (enquiry) {
      return res.status(200).json({
        success: true,
        message: "Enquiry claimed successfully.",
        enquiry
      });
    }

    const exists = await Enquiry.exists({ _id: req.params.id });
    if (!exists) {
      return res.status(404).json({ success: false, message: "Enquiry not found." });
    }

    return res.status(409).json({
      success: false,
      message: "This enquiry has already been claimed or is no longer available."
    });
  } catch (error) {
    next(error);
  }
}

async function getMyEnquiries(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = { assignedTo: req.employee._id, status: "claimed" };

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .sort({ claimedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: enquiries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createPublicEnquiry, getUnclaimedEnquiries, claimEnquiry, getMyEnquiries };