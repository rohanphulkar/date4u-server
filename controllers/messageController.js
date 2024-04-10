import { Chat } from "../models/chat/ChatModel.js";
import { Message } from "../models/chat/MessageModel.js";
import { Notification } from "../models/profile/NotificationModel.js";
import { User } from "../models/profile/UserModel.js";
import { getOnlineUserById, io } from "../server.js";

export const sendMessage = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const { roomName } = req.params;
    const { message } = req.body;
    // Check if the chat room exists
    let chat = await Chat.findOne({ name: roomName });
    if (!chat) {
      // If the chat room doesn't exist, create a new one
      const users = [user._id]; // Assume the sender is always in the chat
      const { user: receiver } = req.body;
      const receiverUser = await User.findOne({ email: receiver });
      if (!receiverUser) {
        return res.status(400).json({ message: "Receiver user not found" });
      }
      users.push(receiverUser._id);
      const newChat = new Chat({
        name: roomName,
        users: users,
      });
      chat = await newChat.save();
    }

    // if user sent an image then save it and create a record of it in message model and also send the image to the room
    if (req.files) {
      for (const file of req.files) {
        var newMessage = new Message({
          image: file.path,
          chat: chat._id,
          sender: user._id,
        });
      }
    } else {
      var newMessage = new Message({
        message: message,
        chat: chat._id,
        sender: user._id,
      });
    }

    const savedMessage = await newMessage.save();

    // Send the message via socket.io
    io.to(roomName).emit("message", savedMessage);

    const onlineUsers = await getOnlineUserById(chat.users);
    onlineUsers.forEach((user) => {
      if (user._id.toString() !== user._id) {
        const notification = new Notification({
          recipient: user._id,
          type: "newMessage",
          message: savedMessage,
        });
        notification.save();
        io.to(user._id).emit("notification", notification);
      }
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { roomName } = req.params;
    const chat = await Chat.findOne({ name: roomName });
    if (!chat) {
      return res.status(400).json({ message: "Room does not exists." });
    }
    const messages = await Message.find({ chat: chat });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { roomName } = req.params;
    const chat = await Chat.findOne({ name: roomName });
    if (!chat) {
      return res.status(400).json({ message: "Room does not exists." });
    }
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(400).json({ message: "Message does not exists." });
    }
    message.remove();
    io.to(roomName).emit("messageDeleted", message);
    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).json(error);
  }
};
