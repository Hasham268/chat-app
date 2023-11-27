const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const sgMail = require("@sendgrid/mail");
const {
  generateToken04,
} = require("../zegoServerAssistant/zegoServerAssistant");

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to authenticate user");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const everyUser = asyncHandler(async (req, res) => {
  const users = await User.find().find({ _id: { $ne: req.user._id } });

  res.send(users);
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name | !email | !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  sgMail.setApiKey(process.env.API_KEY);

  const message = {
    to: email,
    from: {
      name: "Chat Alot",
      email: "osfspk@gmail.com",
    },
    subject: "Registration Successfull",
    text: "Hello! We welcome you to our chat app. Now you can send messages to anyone from anywhere. ",
    html: "<h1>Welcome to Chat Alot</h1> <p>Hello! We welcome you to our chat app. Now you can send messages to anyone from anywhere.</p>",
  };

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
    sgMail
      .send(message)
      .then((response) => console.log("Mail Sent to User"))
      .catch((error) => console.log(error.message));
  } else {
    res.status(400);
    throw new Error("Failed to create user");
  }
});

const generateZegoToken = (req, res) => {
  try {
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_ID;
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";

    if (appId && serverSecret && userId) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );

      res.status(200).send({ token });
    }
  } catch (e) {
    console.log("Error");
    console.log(e);
  }
};

module.exports = {
  registerUser,
  authUser,
  allUsers,
  everyUser,
  generateZegoToken,
};
