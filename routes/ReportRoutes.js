import express from "express";
import { submitReport } from "../controllers/reportController.js";

const router = express.Router();

// Route to submit a report
router.post("/submit-report", submitReport);

export default router;
