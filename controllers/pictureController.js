
import { Picture } from "../models/profile/PictureModel.js";
import jwt from "jsonwebtoken";
import { User } from "../models/profile/UserModel.js";



export const uploadPicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const newPicture = new Picture({
      user: user._id, // Assuming userId is the ID of the user who is uploading the picture
      imageUrl: req.file.path, // Save the path to the uploaded image
    });

    await newPicture.save();

    res.status(201).json({ message: "Picture uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
