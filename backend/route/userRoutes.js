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

router.route("/add-new-team").post(addNewTeamController);

router.route("/add-new-players/:teamId").post(addPlayersController);
router.route("/create-new-match").post(verifyToken,createMatchController);

router.route("/update-toss-details/:matchId").post(updateTossDetailsController);

router
    .route("/update-initial-players/:matchId")
    .post(updateInitialPlayersController);

router.route("/update-score/:matchId").post(updateScoreController);

router.route("/get-all-teams").get(getAllTeamsController);
router.route("/get-single-team/:teamId").get(getSingleTeamController);

router.route("/get-all-matches").get(verifyToken,getAllMatchDetailsController);
router.route("/get-match-details/:matchId").get(getSingleMatchDetailsController);

export default router;
