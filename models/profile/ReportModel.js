import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reportReason: String,
  reportedAt: { type: Date, default: Date.now },
});

reportSchema.post("save", async function (doc, next) {
  try {
    // Find the user associated with this interest
    const user = await mongoose.model("User").findById(doc.reporter);

    if (user) {
      // Add the newly created interest to the user's interest array
      user.reported.push(doc._id); // Assuming _id is used as the identifier for interests
      await user.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const Report = mongoose.model("Report", reportSchema);
