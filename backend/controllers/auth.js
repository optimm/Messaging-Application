const User = require("../db/models/User");

const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (
    !email ||
    email === "" ||
    !name ||
    name === "" ||
    !password ||
    password === ""
  ) {
    throw new BadRequestError("Please provide name, email, password and role");
  }

  let user = await User.findOne({ email });
  if (user) {
    throw new BadRequestError("Email address already in use");
  }
  user = await User.create({ name, email, password, role });
  res.status(StatusCodes.CREATED).json({ success: true, msg: "Registered" });
};

const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || email === "" || !password || password === "") {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new NotFoundError("Not found");
  }

  if (user.role !== role) {
    throw new UnauthenticatedError("Invalid Login");
  }

  //compare password
  const isPasswordTrue = await user.CheckPassword(password);
  if (!isPasswordTrue) {
    throw new UnauthenticatedError("Incorrect password");
  }

  //generate jwt token
  const token = user.CreateJWT({ expires: "30d" });

  // cookie options
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // sameSite: "none",
    // secure: true,
  };

  res
    .status(StatusCodes.OK)
    .cookie("token", token, options)
    .json({
      succcess: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        _id: user._id,
      },
    });
};

const logout = async (req, res) => {
  res
    .status(StatusCodes.OK)
    .cookie("token", null, {
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "Logged out" });
};

//To check my auth and send back my data
const checkMyAuth = async (req, res) => {
  const me = await User.findById(req.user.userId).select("name email role");
  res.status(StatusCodes.OK).json({ success: true, data: me });
};

module.exports = {
  register,
  login,
  logout,
  checkMyAuth,
};
