import { Report } from "../models/profile/ReportModel.js";
import { User } from "../models/profile/UserModel.js";

// Controller to submit a report
export const submitReport = async (req, res) => {
  try {
    const { reporterId, reportedUserId, reportReason } = req.body;

    // Check if both reporter and reported users exist
    const [reporter, reportedUser] = await Promise.all([
      User.findById(reporterId),
      User.findById(reportedUserId),
    ]);

    if (!reporter || !reportedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the report
    const report = new Report({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reportReason: reportReason,
    });

    await report.save();

    res.status(201).json({ message: "Report submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
