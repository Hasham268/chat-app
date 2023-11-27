const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  everyUser,
  generateZegoToken,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser);
router.route("/").get(protect, allUsers);
router.route("/explore").get(protect, everyUser);
router.route("/login").post(authUser);
router.get("/generate-token/:userId", generateZegoToken);

module.exports = router;
