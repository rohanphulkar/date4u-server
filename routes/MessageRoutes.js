import { Router } from "express";
import {
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../controllers/messageController.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "msgs/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/send-message/:roomName", upload.array("files", 50), sendMessage);

router.delete("/delete-message/:roomName", deleteMessage);

router.get("/get-all-messages/:roomName", getAllMessages);

export default router;
