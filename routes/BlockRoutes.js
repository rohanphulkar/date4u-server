import express from "express";
import { blockUser, unblockUser } from "../controllers/blockController.js";

const router = express.Router();

// Route to block a user
router.post("/block", blockUser);

// Route to unblock a user
router.post("/unblock", unblockUser);

export default router;
