import jwt from "jsonwebtoken";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { SignupModel } from "../models/signup.js";
//jwt token verification
const verifyToken = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (accessToken === "null") {
    throw new ApiError(400, "token not found");
  }

  try {
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await SignupModel.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "unauthorize user");
    }
    req.user = user;
  } catch (error) {
    if (error && error.name === "TokenExpiredError") {
      throw new ApiError(403, "access token expired");
    } else {
      throw new ApiError(401, "invalid token");
    }
  }
  next();
});

export default verifyToken;
