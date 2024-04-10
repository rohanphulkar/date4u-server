import { Router } from "express";
import multer from "multer";
import { uploadPicture } from "../controllers/pictureController.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("images", 6), uploadPicture);

export default router;
