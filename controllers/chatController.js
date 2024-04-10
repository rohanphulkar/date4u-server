import { Chat } from "../models/chat/ChatModel.js";
import { User } from "../models/profile/UserModel.js";

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().populate("users", "email", "name");
    return res.status(200).json(chats);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getChatByUserEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }
    const chat = await Chat.find({ users: user }).populate(
      "users",
      "email",
      "name"
    );
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};
