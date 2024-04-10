import mongoose from "mongoose";

// Define the schema for profile picture
const profilePictureSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: {
    type: Buffer,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

profilePictureSchema.post("save", async function (doc, next) {
  try {
    // Find the user associated with this picture
    const user = await User.findById(doc.user);
    if (!user) {
      // If user not found, throw an error
      throw new Error("Associated user not found.");
    }

    // Append the new picture to the user's photos array
    user.photos.push(doc._id);
    await user.save(); // Save the updated user

    next(); // Proceed to the next middleware
  } catch (error) {
    next(error); // Pass error to next middleware
  }
});

// Create a model using the schema
export const Picture = mongoose.model("Picture", profilePictureSchema);
