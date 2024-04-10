import { Block } from "../models/profile/BlockModel.js";
import { User } from "../models/profile/UserModel.js";

export const blockUser = async (req, res) => {
  try {
    const { blockerId, blockedUserId } = req.body;

    // Check if both blocker and blocked users exist
    const [blocker, blockedUser] = await Promise.all([
      User.findById(blockerId),
      User.findById(blockedUserId),
    ]);

    if (!blocker || !blockedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the block already exists
    const existingBlock = await Block.findOne({
      blocker: blockerId,
      blockedUser: blockedUserId,
    });

    if (existingBlock) {
      return res.status(400).json({ message: "User already blocked" });
    }

    // Create the block
    const block = new Block({
      blocker: blockerId,
      blockedUser: blockedUserId,
    });

    await block.save();

    res.status(201).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { blockerId, blockedUserId } = req.body;

    // Check if the block exists
    const block = await Block.findOneAndDelete({
      blocker: blockerId,
      blockedUser: blockedUserId,
    });

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
