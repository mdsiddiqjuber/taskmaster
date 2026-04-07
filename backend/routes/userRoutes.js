// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const { authenticate, restrictTo } = require("../middleware/auth");

router.use(authenticate);

// Admin: list all users
router.get("/", restrictTo("admin"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
    const [users, total] = await Promise.all([
      User.find(filter).skip((page - 1) * limit).limit(Number(limit)).select("-password -refreshToken"),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) { next(err); }
});

// Admin: update user role
router.patch("/:id/role", restrictTo("admin"), async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// Admin: deactivate user
router.patch("/:id/deactivate", restrictTo("admin"), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password");
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

module.exports = router;
