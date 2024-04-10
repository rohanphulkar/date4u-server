import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  blocker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  blockedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  blockedAt: { type: Date, default: Date.now },
});

blockSchema.post("save", async function (doc, next) {
  try {
    // Find the user associated with this interest
    const user = await mongoose.model("User").findById(doc.blocker);

    if (user) {
      // Add the newly created interest to the user's interest array
      user.blocked.push(doc._id); // Assuming _id is used as the identifier for interests
      await user.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const Block = mongoose.model("Block", blockSchema);
