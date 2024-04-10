import bodyParser from "body-parser";
import {
  LoginWithGoogle,
  RegisterWithEmail,
  LoginWithEmail,
  SendPhoneOtp,
  VerifyOTP,
  GetUserProfile,
  ProfileUpdate,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
  likeUser,
  skipUser,
  superLikeUser,
} from "../controllers/userController.js";
import express from "express";
const router = express.Router();

router.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  LoginWithGoogle
);
router.post("/register", RegisterWithEmail);

router.post("/login", LoginWithEmail);

router.post("/send-phone-otp", SendPhoneOtp);

router.post("/verify-otp", VerifyOTP);

router.get("/profile", GetUserProfile);

router.patch("/profile-update", ProfileUpdate);

router.post("/forgot-password", ForgotPassword);

router.post("/reset-password", ResetPassword);

router.patch("/change-password", ChangePassword);

router.post("/like/:userId", likeUser);

router.post("/skip/:userId", skipUser);

router.post("/superlike/:userId", superLikeUser);

export default router;
