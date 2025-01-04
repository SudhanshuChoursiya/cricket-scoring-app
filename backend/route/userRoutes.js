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
    updateCurrentBatsmanController,
    changeStrikeController,
    getAllTeamsController,
    getSingleTeamController,
    getAllMatchDetailsController,
    getSingleMatchDetailsController
} from "../controller/userControllers.js";
import upload from "../middleware/multer.js";
import verifyToken from "../middleware/auth.js";

//routes for login
router.route("/login").post(loginController);

router.route("/refresh-access-token").post(refreshAccessTokenController);

router.route("/check-auth").get(verifyToken, checkAuthController);

router.route("/add-new-team").post(verifyToken, addNewTeamController);

router
    .route("/add-new-players/:teamId")
    .post(verifyToken, addPlayersController);

router.route("/get-all-teams").get(verifyToken, getAllTeamsController);

router
    .route("/get-single-team/:teamId")
    .get(verifyToken, getSingleTeamController);

router.route("/create-new-match").post(verifyToken, createMatchController);

router
    .route("/update-toss-details/:matchId")
    .post(verifyToken, updateTossDetailsController);

router
    .route("/update-initial-players/:matchId")
    .post(verifyToken, updateInitialPlayersController);

router.route("/update-score/:matchId").post(verifyToken, updateScoreController);

router
    .route("/change-bowler/:matchId")
    .post(verifyToken, changeBowlerController);

router
    .route("/update-current-batsman/:matchId")
    .post(verifyToken, updateCurrentBatsmanController);

router
    .route("/change-strike/:matchId")
    .post(verifyToken, changeStrikeController);

router.route("/get-all-matches").get(verifyToken, getAllMatchDetailsController);

router
    .route("/get-match-details/:matchId")
    .get(verifyToken, getSingleMatchDetailsController);

export default router;
