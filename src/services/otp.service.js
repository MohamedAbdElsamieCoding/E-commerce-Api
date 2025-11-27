import Otp from "../models/otp.model.js";
import crypto from "crypto";

//generate otp code
export const generateAndSaveOtp = async (userId) => {
  //creating otp code and hash it
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otpCode).digest("hex");
  //creating expires time
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  //delete any old otp code and save new one
  await Otp.deleteMany({ userId });
  await Otp.create({
    userId,
    otp: {
      hashedOtp,
      expiresAt,
    },
  });
  return otpCode;
};

//verify otp code
export const verifyCode = async (userId, enteredOtp) => {
  const otpRecord = await Otp.findOne({ userId });
  if (!otpRecord) return false;
  const hashedEnteredOtp = crypto
    .createHash("sha256")
    .update(enteredOtp)
    .digest("hex");
  const isMatched = otpRecord.otp.hashedOtp === hashedEnteredOtp;
  if (!isMatched) await Otp.deleteOne({ _id: otpRecord._id });
  return isMatched && otpRecord.otp.expiresAt > new Date();
};
