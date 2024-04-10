import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  matchedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  matchedAt: { type: Date, default: Date.now },
});

matchSchema.post("save", async function (doc, next) {
  try {
    // Find the user associated with this interest
    const user = await mongoose.model("User").findById(doc.user);

    if (user) {
      // Add the newly created interest to the user's interest array
      user.matches.push(doc._id); // Assuming _id is used as the identifier for interests
      await user.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const Match = mongoose.model("Match", matchSchema);
