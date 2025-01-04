import express from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import { SignupModel } from "../models/signup.js";
import { TeamModel } from "../models/team.js";
import { MatchModel } from "../models/match.js";

import {
    uploadToCloudinary,
    removeFromCloudinary
} from "../utility/cloudinary.js";
import { OAuth2Client } from "google-auth-library";
import { io } from "../app.js";
const generateAccessAndRefreshToken = async userId => {
    const user = await SignupModel.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refresh_token = refreshToken;

    await user.save({ validateBeforeSave: false });
    return {
        accessToken,
        refreshToken
    };
};

const loginController = asyncHandler(async (req, res) => {
    const authCode = req.body.authCode;

    //making new OAuth client
    const client = new OAuth2Client({
        clientId: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        redirectUri: process.env.OAUTH2_REDIRECT_URI
    });

    const tokenResponse = await client.getToken({
        code: authCode
    });

    if (!tokenResponse) {
        throw new ApiError(400, "invalid authorzation code");
    }

    client.setCredentials(tokenResponse);

    const { id_token } = tokenResponse.tokens;

    const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.OAUTH2_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const { name, email, picture, sub } = payload;

    const incomingPayload = {
        name,
        email,
        picture,
        sub
    };

    let existingUser = await SignupModel.findOne({
        email
    });

    if (existingUser) {
        let isChanged = false;
        Object.keys(incomingPayload).forEach(field => {
            if (existingUser[field] !== incomingPayload[field]) {
                existingUser[field] = incomingPayload[field];
                isChanged = true;
            }
        });

        if (isChanged) {
            await existingUser.save();
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(existingUser._id);

        res.status(200).json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "login successfull"
            )
        );
    } else {
        const user = await SignupModel.create({
            name,
            email,
            picture,
            sub
        });

        const isUserCreated = await SignupModel.findById(user._id);

        if (!isUserCreated) {
            throw new ApiError(
                500,
                "some error occured , plz try again letter"
            );
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        res.status(200).json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "login successfull"
            )
        );
    }
});

const refreshAccessTokenController = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken;

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.JWT_SECRET
    );

    const user = await SignupModel.findById(decodedToken._id);

    if (!user || user.refresh_token !== incomingRefreshToken) {
        throw new ApiError(400, "invalid Token");
    }

    const accessToken = await user.generateAccessToken();

    res.status(200).json(
        new ApiResponse(
            200,
            { accessToken },
            "access token refresh succesfully"
        )
    );
});

const checkAuthController = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user));
});

const addNewTeamController = asyncHandler(async (req, res) => {
    const { teamName, city, captainName } = req.body;
    const user = req.user;
    const isEmpty = [teamName, city].some(field => {
        if (typeof field === "string") {
            return field.trim() === "";
        } else {
            return field === undefined || field === null;
        }
    });

    if (isEmpty) {
        throw new ApiError(400, "plz fill all the required field");
    }

    const team = await TeamModel.create({
        team_name: teamName,
        city: city,
        captain_name: captainName,
        createdBy: user._id
    });

    if (!team) {
        throw new ApiError(500, "unexpected error, plz try again letter");
    }
    res.status(200).json(new ApiResponse(200, team, "team added successfully"));
});

const getAllTeamsController = asyncHandler(async (req, res) => {
    const user = req.user;
    const teams = await TeamModel.find({ createdBy: user._id });

    if (!teams) {
        throw new ApiError(404, "no teams has been found");
    }
    res.status(200).json(new ApiResponse(200, teams));
});

const getSingleTeamController = asyncHandler(async (req, res) => {
    const user = req.user;
    const teamId = req.params.teamId;
    const team = await TeamModel.findOne({ _id: teamId, createdBy: user._id });

    if (!team) {
        throw new ApiError(404, "no team has been found");
    }
    res.status(200).json(new ApiResponse(200, team));
});

const addPlayersController = asyncHandler(async (req, res) => {
    const user = req.user;
    const players = req.body.players;
    const teamId = req.params.teamId;

    const parsedPlayers = await players.filter(
        item => item.name && item.name.trim() !== ""
    );

    if (parsedPlayers.length === 0) {
        throw new ApiError(400, " plz add atleast one player");
    }

    const team = await TeamModel.findOne({ _id: teamId, createdBy: user._id });

    if (!team) {
        throw new ApiError(404, "no team has been found");
    }

    team.players = [...team.players, ...parsedPlayers];

    const updatedTeam = await team.save();

    if (!updatedTeam) {
        throw new ApiError(500, "unexpected error occured try again latter !");
    }

    res.status(200).json(
        new ApiResponse(200, updatedTeam, "players added Successfully")
    );
});

const createMatchController = asyncHandler(async (req, res) => {
    const { teamA, teamB, totalOvers, matchPlace } = req.body;
    const user = req.user;
    const isEmpty = [
        teamA.name,
        teamB.name,
        teamA.playing11,
        teamB.playing11,
        totalOvers,
        matchPlace.city,
        matchPlace.ground
    ].some(field => {
        if (Array.isArray(field)) {
            return field.length !== 11;
        } else if (typeof field === "string") {
            return field.trim() === "";
        } else {
            return field === null || field === undefined;
        }
    });

    if (isEmpty) {
        throw new ApiError(400, "required filed can not be empty");
    }

    if (isNaN(totalOvers) || Number(totalOvers) <= 0) {
        throw new ApiError(400, "total over should be greater then 0");
    }

    const initialInningDetails = {
        battingTeam: {
            name: null,
            playing11: null
        },
        bowlingTeam: {
            name: null,
            playing11: null
        },
        totalOvers
    };

    const match = await MatchModel.create({
        inning1: initialInningDetails,
        inning2: initialInningDetails,
        teamA,
        teamB,
        matchPlace,
        createdBy: user._id
    });

    if (!match) {
        throw new ApiError(
            500,
            "there is some issue in creating match,try again letter"
        );
    }

    res.status(200).json(
        new ApiResponse(200, match, "match created successfully")
    );
});

const updateTossDetailsController = asyncHandler(async (req, res) => {
    const { tossWinner, tossDecision } = req.body;
    const user = req.user;
    const matchId = req.params.matchId;

    const isEmpty = [tossWinner, tossDecision].some(field => {
        if (typeof field === "string") {
            return field.trim() === "";
        } else {
            return field === null || field === undefined;
        }
    });

    if (isEmpty) {
        throw new ApiError(400, "required field can not be empty");
    }

    const match = await MatchModel.findOne({
        _id: matchId,
        createdBy: user._id
    });

    if (!match) {
        throw new ApiError(500, "no match has been found");
    }

    let battingTeam, bowlingTeam;

    if (tossDecision === "bat") {
        battingTeam =
            tossWinner === match.teamA.name ? match.teamA : match.teamB;
        bowlingTeam =
            tossWinner === match.teamA.name ? match.teamB : match.teamA;
    } else if (tossDecision === "ball") {
        bowlingTeam =
            tossWinner === match.teamA.name ? match.teamA : match.teamB;
        battingTeam =
            tossWinner === match.teamA.name ? match.teamB : match.teamA;
    }

    match.inning1.battingTeam = battingTeam;
    match.inning1.bowlingTeam = bowlingTeam;

    match.inning2.battingTeam = bowlingTeam;
    match.inning2.bowlingTeam = battingTeam;

    match.matchStatus = "toss happend";
    match.toss.tossWinner = tossWinner;
    match.toss.tossDecision = tossDecision;
    await match.save();

    res.status(200).json(
        new ApiResponse(200, match, "toss details updated successfully")
    );
});

const updateInitialPlayersController = asyncHandler(async (req, res) => {
    const { strikeBatsmanId, nonStrikeBatsmanId, currentBowlerId } = req.body;
    const user = req.user;
    const matchId = req.params.matchId;

    const isEmpty = [strikeBatsmanId, nonStrikeBatsmanId, currentBowlerId].some(
        field => {
            if (typeof field === "string") {
                return field.trim() === "";
            } else {
                return field === null || field === undefined;
            }
        }
    );

    if (isEmpty) {
        throw new ApiError(400, "required filed can not be empty");
    }

    const match = await MatchModel.findOne({
        _id: matchId,
        createdBy: user._id
    });

    if (!match) {
        throw new ApiError(404, "match not found");
    }

    const currentInning =
        match.currentInning === 1 ? match.inning1 : match.inning2;

    const battingTeam = currentInning.battingTeam;
    const bowlingTeam = currentInning.bowlingTeam;

    const strikeBatsman = battingTeam.playing11.find(player =>
        player._id.equals(strikeBatsmanId)
    );

    const nonStrikeBatsman = battingTeam.playing11.find(player =>
        player._id.equals(nonStrikeBatsmanId)
    );

    const currentBowler = bowlingTeam.playing11.find(player =>
        player._id.equals(currentBowlerId)
    );

    currentInning.currentBatsmen = [
        { ...strikeBatsman.toObject(), onStrike: true },
        { ...nonStrikeBatsman.toObject(), onStrike: false }
    ];

    currentInning.currentBowler = currentBowler;
    match.isInningChangePending = false;
    if (match.currentInning === 2) {
        match.isSecondInningStarted = true;
    }
    await match.save();

    res.status(200).json(
        new ApiResponse(200, match, "initial player updated successfully")
    );
});

const updateScoreController = asyncHandler(async (req, res) => {
    const {
        runs,
        isWide,
        isNoBall,
        isLegBye,
        isBye,
        isWicket,
        outMethod,
        fielderId,
        runoutEnd
    } = req.body;

    const user = req.user;
    const matchId = req.params.matchId;

    const match = await MatchModel.findOne({
        _id: matchId,
        createdBy: user._id
    });

    if (!match) {
        throw new ApiError(404, "match not found");
    }

    const currentInning =
        match.currentInning === 1 ? match.inning1 : match.inning2;

    const currentBatsmen = currentInning.currentBatsmen;

    const currentBowler = currentInning.currentBowler;

    const strikeBatsman = currentBatsmen.find(batsman => batsman.onStrike);

    const nonStrikeBatsman = currentBatsmen.find(
        batsman => batsman.onStrike === false
    );

    const batter = currentInning.battingTeam.playing11.find(player =>
        player._id.equals(strikeBatsman._id)
    );

    const bowler = currentInning.bowlingTeam.playing11.find(player =>
        player._id.equals(currentBowler._id)
    );
    const currentFielder = currentInning.bowlingTeam.playing11.find(player =>
        player._id.equals(fielderId)
    );
    const checkGameProgress = () => {
        if (match.currentInning === 1) {
            if (
                match.inning1.wicketsFallen >= 10 ||
                match.inning1.currentOvers >= match.inning1.totalOvers
            ) {
                match.currentInning = 2;
                match.targetScore = match.inning1.totalScore + 1;
                match.isInningChangePending = true;

                io.emit("inningCompleted");
            }
        }

        if (match.currentInning === 2) {
            if (match.inning2.totalScore >= match.targetScore) {
                match.matchStatus = "completed";

                match.matchWinner.teamName = match.inning2.battingTeam.name;

                match.matchWinner.wonBy = `${
                    10 - match.inning2.wicketsFallen
                } wickets`;
                io.emit("matchCompleted");
            } else if (
                match.inning2.currentOvers >= match.inning2.totalOvers ||
                match.inning2.wicketsFallen >= 10
            ) {
                match.matchStatus = "completed";
                match.matchWinner.teamName = match.inning2.bowlingTeam.name;

                match.matchWinner.wonBy = `${
                    match.targetScore - match.inning2.totalScore
                } runs`;
                io.emit("matchCompleted");
            }
        }
    };

    // Helper function to update runs, balls faced, and boundary stats
    const updateRegularBall = () => {
        currentInning.totalScore += runs;

        currentInning.currentOverBalls += 1;

        strikeBatsman.runs += runs;

        strikeBatsman.balls += 1;
        batter.runs += runs;
        batter.balls += 1;
        // Update boundary stats
        if (runs === 4) {
            strikeBatsman.fours += 1;
            batter.fours += 1;
        }
        if (runs === 6) {
            strikeBatsman.sixes += 1;
            batter.sixes += 1;
        }
        // Update player stats in the team as well

        currentBowler.ballsBowled += 1;
        currentBowler.runsConceded += runs;
        bowler.ballsBowled += 1;
        bowler.runsConceded += runs;

        if (isWicket) {
            if (outMethod === "run out" && runoutEnd === "striker") {
                strikeBatsman.isOut = true;
                strikeBatsman.outMethod = outMethod;
                strikeBatsman.caughtBy = currentFielder.name;
                batter.isOut = true;
                batter.outMethod = outMethod;
                batter.caughtBy = currentFielder.name;
                currentInning.wicketsFallen += 1;
            } else if (outMethod === "run out" && runoutEnd === "nonStriker") {
                nonStrikeBatsman.isOut = true;
                nonStrikeBatsman.outMethod = outMethod;
                nonStrikeBatsman.caughtBy = currentFielder.name;
                batter.isOut = true;
                batter.outMethod = outMethod;
                batter.caughtBy = currentFielder.name;
                currentInning.wicketsFallen += 1;
            } else {
                strikeBatsman.isOut = true;
                strikeBatsman.outMethod = outMethod;
                strikeBatsman.caughtBy = currentFielder.name;
                strikeBatsman.dismissBy = currentBowler.name;
                batter.isOut = true;
                batter.outMethod = outMethod;
                batter.caughtBy = currentFielder.name;
                batter.dismissBy = currentBowler.name;
                currentInning.wicketsFallen += 1;
                currentBowler.wickets += 1;
                bowler.wickets += 1;
            }
            const isLastBall =
                currentInning.currentOvers === currentInning.totalOvers - 1 &&
                currentInning.currentOverBalls === 6;
            if (!isLastBall && currentInning.wicketsFallen !== 10) {
                if (
                    currentInning === 2 &&
                    inning2.totalScore !== match.targetScore
                ) {
                    match.isSelectNewBatsmanPending = true;
                    io.emit("wicketFallen");
                } else {
                    match.isSelectNewBatsmanPending = true;
                    io.emit("wicketFallen");
                }
            }
        }
    };

    // Helper function to handle extras (wide, no-ball, leg-bye, bye)
    const updateExtras = () => {
        currentInning.totalScore += 1 + runs;
        if (isLegBye || isBye) {
            currentInning.currentOverBalls += 1;
        } else if (isNoBall) {
            strikeBatsman.runs += runs;

            batter.runs += runs;

            if (runs === 4) {
                strikeBatsman.fours += 1;
                batter.fours += 1;
            }
            if (runs === 6) {
                strikeBatsman.sixes += 1;
                batter.sixes += 1;
            }

            currentBowler.runsConceded += 1 + runs;
            bowler.runsConceded += 1 + runs;
        } else if (isWide) {
            currentBowler.runsConceded += 1 + runs;
            bowler.runsConceded += 1 + runs;
        }

        if (isWicket) {
            if (outMethod === "runout" && runoutEnd === "striker") {
                strikeBatsman.isOut = true;
                strikeBatsman.outMethod = outMethod;
                strikeBatsman.caughtBy = currentFielder.name;
                batter.isOut = true;
                batter.outMethod = outMethod;
                batter.caughtBy = currentFielder.name;
                currentInning.wicketsFallen += 1;
            } else if (outMethod === "runout" && runoutEnd === "nonStriker") {
                nonStrikeBatsman.isOut = true;
                nonStrikeBatsman.outMethod = outMethod;
                nonStrikeBatsman.caughtBy = currentFielder.name;
                batter.isOut = true;
                batter.outMethod = outMethod;
                batter.caughtBy = currentFielder.name;
                currentInning.wicketsFallen += 1;
            } else {
                strikeBatsman.isOut = true;
                strikeBatsman.outMethod = outMethod;
                strikeBatsman.caughtBy = currentFielder.name;
                strikeBatsman.dismissBy = currentBowler.name;
                batter.isOut = true;
                batter.outMethod = outMethod;
                batter.caughtBy = currentFielder.name;
                batter.dismissBy = currentBowler.name;
                currentInning.wicketsFallen += 1;
                currentBowler.wickets = +1;
                bowler.wickets = +1;
            }
            const isLastBall =
                currentInning.currentOvers === currentInning.totalOvers - 1 &&
                currentInning.currentOverBalls === 6;
            if (!isLastBall && currentInning.wicketsFallen !== 10) {
                if (
                    currentInning === 2 &&
                    inning2.totalScore !== match.targetScore
                ) {
                    match.isSelectNewBatsmanPending = true;
                    io.emit("wicketFallen");
                } else {
                    match.isSelectNewBatsmanPending = true;
                    io.emit("wicketFallen");
                }
            }
        }
    };

    // Helper function to switch strike
    const switchStrike = () => {
        if (runs % 2 !== 0 && !isWide && !isNoBall && !isLegBye && !isBye) {
            currentInning.currentBatsmen.forEach(
                batsman => (batsman.onStrike = !batsman.onStrike)
            );
        }
    };

    // Helper function to end the over and handle over completion
    const endOver = () => {
        if (currentInning.currentOverBalls === 6) {
            currentInning.currentOvers += 1;
            currentInning.currentOverBalls = 0;

            // Only switch strike at the end of the over if the last ball was an even run
            if (runs % 2 === 0) {
                currentInning.currentBatsmen.forEach(
                    batsman => (batsman.onStrike = !batsman.onStrike)
                );
            }

            if (
                currentInning.currentOvers !== currentInning.totalOvers &&
                currentInning.wicketsFallen !== 10
            ) {
                if (match.currentInning === 2) {
                    if (match.inning2.totalScore !== match.targetScore) {
                        match.isOverChangePending = true;
                        io.emit("overCompleted");
                    }
                } else {
                    match.isOverChangePending = true;
                    io.emit("overCompleted");
                }
            }
        }
    };

    // Helper function to switch innings

    // Run updates based on the type of ball

    if (!isWide && !isNoBall && !isLegBye && !isBye) {
        updateRegularBall();
    } else {
        updateExtras();
    }

    switchStrike();
    endOver();
    checkGameProgress();
    io.emit("scoreUpdated", match);
    // Save match details
    await match.save();

    // Prepare the response
    const response = {
        match
    };

    // Return the response
    res.status(200).json(
        new ApiResponse(200, response, "match score updated successfully")
    );
});

//change bowler controller
const changeBowlerController = asyncHandler(async (req, res) => {
    const { newBowlerId } = req.body;
    const user = req.user;
    const matchId = req.params.matchId;
    if (!newBowlerId) {
        throw new ApiError(400, "plz provide new bolwer id");
    }

    const match = await MatchModel.findOne({
        _id: matchId,
        createdBy: user._id
    });

    if (!match) {
        throw new ApiError(404, "match not found");
    }

    const currentInning =
        match.currentInning === 1 ? match.inning1 : match.inning2;

    const newBowler = currentInning.bowlingTeam.playing11.find(player =>
        player._id.equals(newBowlerId)
    );

    currentInning.currentBowler = newBowler;
    match.isOverChangePending = false;
    await match.save();

    res.status(200).json(
        new ApiResponse(200, match, "bowler changed successfully")
    );
});

const updateCurrentBatsmanController = asyncHandler(async (req, res) => {
    const newBatsmanId = req.body.newBatsmanId;
    const user = req.user;
    const matchId = req.params.matchId;

    if (!newBatsmanId) {
        throw new ApiError(400, "plz provide new batsman id");
    }

    const match = await MatchModel.findOne({
        _id: matchId,
        createdBy: user._id
    });

    if (!match) {
        throw new ApiError(404, "match not found");
    }

    const currentInning =
        match.currentInning === 1 ? match.inning1 : match.inning2;

    const battingTeam = currentInning.battingTeam;

    const newBatsman = battingTeam.playing11.find(player =>
        player._id.equals(newBatsmanId)
    );

    const outBatsman = currentInning.currentBatsmen.find(
        batsman => batsman.isOut
    );

    const updatedCurrentBatsmen = currentInning.currentBatsmen.map(batsman =>
        batsman.isOut
            ? { ...newBatsman.toObject(), onStrike: outBatsman.onStrike }
            : batsman
    );

    currentInning.currentBatsmen = updatedCurrentBatsmen;

    match.isSelectNewBatsmanPending = false;

    await match.save();

    res.status(200).json(
        new ApiResponse(200, match, "batsman changed successfully")
    );
});

const changeStrikeController = asyncHandler(async (req, res) => {
    const user = req.user;
    const matchId = req.params.matchId;

    const match = await MatchModel.findOne({
        _id: matchId,
        createdBy: user._id
    });

    if (!match) {
        throw new ApiError(404, "match not found");
    }

    const currentInning =
        match.currentInning === 1 ? match.inning1 : match.inning2;

    currentInning.currentBatsmen = currentInning.currentBatsmen.map(batsmen => {
        return { ...batsmen, onStrike: !batsmen.onStrike };
    });

    await match.save();

    res.status(200).json(
        new ApiResponse(200, match, "bowler changed successfully")
    );
});

const getAllMatchDetailsController = asyncHandler(async (req, res) => {
    const user = req.user;
    const matchDetails = await MatchModel.find({ createdBy: user._id });

    if (!matchDetails) {
        throw new ApiError(404, "no match has been found");
    }
    res.status(200).json(new ApiResponse(200, matchDetails));
});

const getSingleMatchDetailsController = asyncHandler(async (req, res) => {
    const user = req.user;
    const matchId = req.params.matchId;
    const matchDetails = await MatchModel.findOne({
        _id: matchId,
        createdBy: user._id
    });

    if (!matchDetails) {
        throw new ApiError(404, "no match has been found");
    }
    res.status(200).json(new ApiResponse(200, matchDetails));
});

export {
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
};
