import express from "express";
const router = express.Router();
import {
    loginController,
    refreshAccessTokenController,
    checkAuthController,
    addNewTeamController,
    addPlayersController,
    createMatchController,
    updateTossDetailsController,
    updateInitialPlayersController,
    updateScoreController,
    changeBowlerController,
    changeBatsmanController,
    updateOutBatsmanController,
    changeStrikeController,
    replacePlayerController,
    changeCaptainController,
    addSubstitutesController,
    removeSubstitutesController,
    undoScoreController,
    startSuperOverController,
    endInningController,
    endMatchController,
    getAllTeamsController,
    getSingleTeamController,
    getAllMatchDetailsController,
    getSingleMatchDetailsController,
    getSearchedMatchController
} from "../controller/userControllers.js";
import upload from "../middleware/multer.js";
import verifyToken from "../middleware/auth.js";
import rateLimiter from "../middleware/rateLimiter.js";

// Apply rate limiter to all POST routes
router.post("/login", rateLimiter, loginController);
router.post("/refresh-access-token", rateLimiter, refreshAccessTokenController);
router.post("/add-new-team", rateLimiter, verifyToken, addNewTeamController);
router.post(
    "/add-new-players/:teamId",
    rateLimiter,
    verifyToken,
    addPlayersController
);
router.post(
    "/create-new-match",
    rateLimiter,
    verifyToken,
    createMatchController
);
router.post(
    "/update-toss-details/:matchId",
    rateLimiter,
    verifyToken,
    updateTossDetailsController
);
router.post(
    "/update-initial-players/:matchId",
    rateLimiter,
    verifyToken,
    updateInitialPlayersController
);
router.post(
    "/update-score/:matchId",
    rateLimiter,
    verifyToken,
    updateScoreController
);
router.post(
    "/change-bowler/:matchId",
    rateLimiter,
    verifyToken,
    changeBowlerController
);
router.post(
    "/change-batsman/:matchId",
    rateLimiter,
    verifyToken,
    changeBatsmanController
);
router.post(
    "/update-out-batsman/:matchId",
    rateLimiter,
    verifyToken,
    updateOutBatsmanController
);
router.post(
    "/change-strike/:matchId",
    rateLimiter,
    verifyToken,
    changeStrikeController
);
router.post(
    "/replace-player/:matchId",
    rateLimiter,
    verifyToken,
    replacePlayerController
);
router.post(
    "/change-captain/:matchId",
    rateLimiter,
    verifyToken,
    changeCaptainController
);
router.post(
    "/add-substitutes/:matchId",
    rateLimiter,
    verifyToken,
    addSubstitutesController
);
router.post(
    "/remove-substitutes/:matchId",
    rateLimiter,
    verifyToken,
    removeSubstitutesController
);
router.post(
    "/undo-score/:matchId",
    rateLimiter,
    verifyToken,
    undoScoreController
);
router.post(
    "/start-super-over/:matchId",
    rateLimiter,
    verifyToken,
    startSuperOverController
);
router.post(
    "/end-inning/:matchId",
    rateLimiter,
    verifyToken,
    endInningController
);
router.post(
    "/end-match/:matchId",
    rateLimiter,
    verifyToken,
    endMatchController
);

// GET routes remain unchanged
router.get("/check-auth", verifyToken, checkAuthController);
router.get("/get-all-teams", verifyToken, getAllTeamsController);
router.get("/get-single-team/:teamId", verifyToken, getSingleTeamController);
router.get("/get-all-matches", getAllMatchDetailsController);
router.get("/get-match-details/:matchId", getSingleMatchDetailsController);
router.get("/search-match", verifyToken, getSearchedMatchController);

export default router;
