import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const signupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  picture: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  sub: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
  },
});

signupSchema.methods.generateAccessToken = async function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

signupSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const SignupModel = mongoose.model("UserSignup", signupSchema);
