import { Webhook } from "svix";
import { User } from "../models/profile/UserModel.js";
import { generateOTP, sendOTP } from "../utils/sendOTP.js";
import jwt from "jsonwebtoken";
import { SendEmail } from "../utils/sendEmail.js";
import { checkPassword } from "../utils/checkPassword.js";
import { generateUniqueID } from "../utils/GenerateUniqueId.js";
import { getOnlineUserById, io } from "../server.js";
import { Notification } from "../models/profile/NotificationModel.js";

export const RegisterWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      email,
      password,
      isVerified: true,
    });
    return res.status(201).json({ message: "User created", user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const SendPhoneOtp = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { phone } = req.body;

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    if (!phone) {
      return res.status(400).json({ message: "No phone provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById({ _id: decoded._id });
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }
    const otp = generateOTP();
    user.phone = phone;
    user.otp = otp;
    await user.save();
    const otpSent = await sendOTP(user.phone, otp);
    if (!otpSent) {
      return res.status(400).json({
        error: "Failed to send OTP",
      });
    }
    return res.status(200).json({
      message: "OTP sent",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const VerifyOTP = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { otp } = req.body;

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }
    if (!otp) {
      return res.status(400).json({ message: "No otp provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById({ _id: decoded._id });
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    user.isVerified = true;
    user.otp = null;
    await user.save();
    return res.status(200).json({
      message: "OTP verified",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const LoginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified" });
    }
    const isMatch = await checkPassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: 3600,
      }
    );
    return res.status(200).json({ token });
  } catch (error) {}
};

export const GetUserProfile = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select("-password");

    if (user.likes) {
      // Get likes count
      var likesCount = user.likes.length;
    }

    return res.status(200).json({ user, likesCount });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const ProfileUpdate = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findOneAndUpdate({ _id: decoded._id }, req.body);
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    pwdResetToken = generateUniqueID();
    user.pwdResetToken = pwdResetToken;
    user.pwdResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const subject = `Date4You Password Reset`;
    const body = `Hi ${user.name},\n\nPlease use the following link to reset your password:\n\nhttp://localhost:3000/reset-password/${pwdResetToken}\n\nIf you did not make this request, please ignore this email and your password will remain unchanged.\n\nSincerely,\nDate4You Team\n`;
    const emailSent = await SendEmail(email, subject, body);
    if (!emailSent) {
      return res.status(400).json({
        error: "Failed to send email",
      });
    }
    return res.status(200).json({ message: "Email sent" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const user = await User.findOne({ pwdResetToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }
    if (Date.now() > user.pwdResetExpires) {
      return res.status(400).json({ message: "Token expired" });
    }
    user.password = password;
    user.pwdResetToken = null;
    user.pwdResetExpires = null;
    await user.save();
    return res.status(200).json({ message: "Password reset" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const { authorization } = req.headers;

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById({ _id: decoded._id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const isMatch = await checkPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is invalid" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const LoginWithGoogle = async (req, res) => {
  try {
    const payloadString = req.body;
    const svixHeaders = req.headers;

    const wh = new Webhook("whsec_Ca1m32TL6o+gEd3RwaD05+WVwE+A61eT");
    const evt = wh.verify(JSON.stringify(payloadString), svixHeaders);
    const { id, ...attributes } = evt.data;
    // Handle the webhooks
    const eventType = evt.type;
    if (eventType == "user.created") {
      console.log("User created");
    }
    if (eventType == "session.created") {
      console.log("Session created");
    }
    console.log(evt.data);
    res.status(200).json({ msg: "hi" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

export const likeUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const userToLike = await User.findById(userId);
    if (!userToLike) {
      return res.status(404).json({ error: "User not found" });
    }
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const currentUser = await User.findById(decoded._id);
    if (!currentUser) {
      return res.status(400).json({ message: "User not found" });
    }
    currentUser.likes.push(userToLike);
    await currentUser.save();

    const onlineUser = getOnlineUserById(userToLike._id);
    const socketId = onlineUser.socketId;
    const newNotification = new Notification({
      type: "like",
      recipient: userToLike._id,
      message: `${currentUser.name} liked your profile!`,
    });
    io.to(socketId).emit("like", newNotification);
    return res.json({ message: "User liked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const skipUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const userToSkip = await User.findById(userId);
    if (!userToSkip) {
      return res.status(404).json({ error: "User not found" });
    }
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const currentUser = await User.findById(decoded._id);
    if (!currentUser) {
      return res.status(400).json({ message: "User not found" });
    }

    currentUser.skipped.push(userToSkip);
    await currentUser.save();

    return res.json({ message: "User skipped successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const superLikeUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const userToSuperLike = await User.findById(userId);
    if (!userToSuperLike) {
      return res.status(404).json({ error: "User not found" });
    }
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const currentUser = await User.findById(decoded._id);
    if (!currentUser) {
      return res.status(400).json({ message: "User not found" });
    }

    currentUser.superLikes.push(userToSuperLike);
    await currentUser.save();

    const newNotification = new Notification({
      type: "superlike",
      recipient: userToSuperLike._id,
      message: `${currentUser.name} gave you super like.`,
    });
    const onlineUser = getOnlineUserById(userToSuperLike._id);
    if (onlineUser && onlineUser.socketId) {
      const socketId = onlineUser.socketId;
      io.to(socketId).emit("superlike", newNotification);
    }
    return res.json({ message: "User super liked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
