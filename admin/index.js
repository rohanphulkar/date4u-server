import * as AdminJSMongoose from "@adminjs/mongoose";
import AdminJS, { ComponentLoader } from "adminjs";
import { DefaultAuthProvider } from "adminjs";
import { User } from "../models/profile/UserModel.js";
import { Match } from "../models/profile/MatchModel.js";
import { Block } from "../models/profile/BlockModel.js";
import { Report } from "../models/profile/ReportModel.js";
import { Message } from "../models/chat/MessageModel.js";
import { checkPassword } from "../utils/checkPassword.js";
import { Chat } from "../models/chat/ChatModel.js";
import { Picture } from "../models/profile/PictureModel.js";
import uploadFeature from "@adminjs/upload";

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const authenticate = async ({ email, password }, ctx) => {
  const user = await User.where({ email }).findOne();
  if (!user) {
    return;
  }
  const isMatch = await checkPassword(password, user.password);
  if (!isMatch) {
    return;
  }
  if (!user.isAdmin) {
    return;
  }
  return { email };
};

export const authProvider = new DefaultAuthProvider({
  authenticate,
});

const localProvider = {
  bucket: "public/images",
  opts: {
    baseUrl: "/images",
  },
};

const componentLoader = new ComponentLoader();

const pictures = {
  resource: Picture,
  options: {
    navigation: null,
  },
  features: [
    uploadFeature({
      componentLoader,
      provider: { local: localProvider },
      validation: {
        mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      },
      properties: {
        key: "imageUrl",
        mimeType: "mimeType",
      },
      options: {
        key: 323,
        bucket: "../public/images",
        s3Key: "uploadFeature",
      },
    }),
  ],
};

const adminOptions = {
  branding: {
    companyName: "Date4U Admin",
    logo: "/assets/dat4u.png",
    favicon: "/assets/dat4u.png",
  },
  resources: [
    {
      resource: User,
      options: {
        navigation: {
          icon: "User",
        },
      },
    },

    {
      resource: Match,
      options: {
        navigation: null,
      },
    },
    {
      resource: Block,
      options: {
        navigation: null,
      },
    },
    {
      resource: Report,
      options: {
        navigation: null,
      },
    },
    {
      resource: Message,
      options: {
        navigation: null,
      },
    },
    {
      resource: Chat,
      options: {
        navigation: null,
      },
    },

    pictures,
  ],
};

// Create an instance of AdminJS with branding
export const admin = new AdminJS(adminOptions);
