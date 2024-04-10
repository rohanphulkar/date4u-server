import mongoose from "mongoose";
import bcrypt from "bcrypt";

var SALT_WORK_FACTOR = 10;

const promptSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  prompt: { type: String, required: true },
  answer: { type: String },
});

const interestSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String },
});

const userSchema = new mongoose.Schema({
  uid: { type: String, required: false },
  sessionId: {
    type: String,
    required: false,
  },
  name: { type: String, required: false },
  email: { type: String, unique: true },
  phone: {
    type: String,
    required: false,
    unique: true,
  },
  password: { type: String, required: false },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  provider: {
    type: String,
    required: true,
    default: "email",
  },
  otp: { type: String, required: false },
  pwdResetToken: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  interests: [interestSchema],
  prompts: [promptSchema],
  lookingFor: {
    type: String,
  },
  height: Number,
  relationType: {
    type: String,
  },
  zodiac: {
    type: String,
  },
  languages: {
    type: String,
  },
  education: {
    type: String,
  },
  familyPlans: {
    type: String,
  },
  covidVaccine: {
    type: String,
  },
  personalityType: {
    type: String,
  },
  communicationStyle: {
    type: String,
  },
  loveStyle: {
    type: String,
  },
  pets: {
    type: String,
  },
  drinking: {
    type: String,
  },
  smoking: {
    type: String,
  },
  workout: {
    type: String,
  },
  dietaryPreference: {
    type: String,
  },
  socialMedia: {
    type: String,
  },
  sleepingHabits: {
    type: String,
  },
  jobTitle: String,
  company: String,
  school: String,
  livingIn: String,
  hometown: String,
  gender: String,
  sexualOrientation: String,
  photos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Picture",
    },
  ],
  age: Number,
  religion: String,
  ethnicity: String,
  skipped: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  liked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  reported: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  superLikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);

    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // Replace the plain password with the hashed one
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre(
  ["updateOne", "findByIdAndUpdate", "findOneAndUpdate"],
  async function (next) {
    try {
      const data = this.getUpdate();
      if (data.password) {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        data.password = await bcrypt.hash(data.password, salt);
      }
      next();
    } catch (error) {
      next(error);
    }
  }
);

export const User = mongoose.model("User", userSchema);
