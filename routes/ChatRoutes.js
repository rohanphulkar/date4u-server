import { Router } from "express";
import {
  deleteChat,
  getAllChats,
  getChatByUserEmail,
} from "../controllers/chatController.js";

const router = Router();

router.get("/", getAllChats);

router.get("/get-chat/:email", getChatByUserEmail);

router.delete("/deleteChat/:id", deleteChat);

export default router;
