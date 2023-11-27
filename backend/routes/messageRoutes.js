const express = require("express");
const {
  allMessages,
  sendMessage,
  addImageMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

const uploadImage = multer({ dest: "uploads/images/" });

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.post("/add-image-message", protect, uploadImage.single("image"), addImageMessage);
module.exports = router;
