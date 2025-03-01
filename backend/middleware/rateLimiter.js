import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utility/ApiError.js";

const rateLimiter = rateLimit({
    windowMs: 1000,
    limit: 1,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: () => {
        throw new ApiError(429, "slow down my dear friend");
    }
});

export default rateLimiter;
