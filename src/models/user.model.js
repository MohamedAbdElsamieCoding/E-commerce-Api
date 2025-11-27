import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { userRoles } from "../utils/userRoles.js";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 30,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 30,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      validate: [validator.isEmail, "Invalid Email"],
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minLength: 8,
    },
    role: {
      type: String,
      enum: [userRoles.ADMIN, userRoles.SELLER, userRoles.USER],
      default: userRoles.USER,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
  },
  { versionKey: false }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
const User = mongoose.model("User", userSchema);
export default User;
