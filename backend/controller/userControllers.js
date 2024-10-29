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
        audience: process.env.CLIENT_ID
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
        captain_name: captainName
    });

    if (!team) {
        throw new ApiError(500, "unexpected error, plz try again letter");
    }
    res.status(200).json(new ApiResponse(200, team, "team added successfully"));
});

const getAllTeamsController = asyncHandler(async (req, res) => {
    const teams = await TeamModel.find();

    if (!teams) {
        throw new ApiError(404, "no teams has been found");
    }
    res.status(200).json(new ApiResponse(200, teams));
});
const getSingleTeamController = asyncHandler(async (req, res) => {
    const teamId = req.params.teamId;
    const team = await TeamModel.findById(teamId);

    if (!team) {
        throw new ApiError(404, "no team has been found");
    }
    res.status(200).json(new ApiResponse(200, team));
});

const addPlayersController = asyncHandler(async (req, res) => {
    const players = req.body.players;
    const teamId = req.params.teamId;

    const parsedPlayers = await players.filter(
        item => item.name && item.name.trim() !== ""
    );

    if (parsedPlayers.length === 0) {
        throw new ApiError(400, " plz add atleast one player");
    }

    const team = await TeamModel.findById(teamId);

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
        battingTeam: null,
        bowlingTeam: null,
        totalOvers
    };

    const match = await MatchModel.create({
        inning1: initialInningDetails,
        inning2: initialInningDetails,
        teamA,
        teamB,
        matchPlace
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

    const matchId = req.params.matchId;

    const match = await MatchModel.findById(matchId);

    if (!match) {
        throw new ApiError(500, "no match has been found");
    }

    let battingTeam, bowlingTeam;

    if (tossDecision === "bat") {
        battingTeam =
            tossWinner === match.teamA.name ? match.teamA : match.teamB;
        bowlingTeam =
            tossWinner === match.teamA.name ? match.teamB : match.teamA;
    } else if (tossDecision === "bowl") {
        bowlingTeam =
            tossWinner === match.teamA.name ? match.teamA : match.teamB;
        battingTeam =
            tossWinner === match.teamA.name ? match.teamB : match.teamA;
    }

    match.inning1.battingTeam = battingTeam;
    match.inning1.bowlingTeam = bowlingTeam;
    match.matchStatus = "toss happend";
    match.toss.tossWinner = tossWinner;
    match.toss.tossDecision = tossDecision;
    await match.save();

    res.status(200).json(
        new ApiResponse(200, match, "toss details updated successfully")
    );
});

const updateScoreController = asyncHandler(async (req, res) => {
    // Helper function to switch innings
    const switchInnings = match => {
        match.currentInning = 2;
        match.targetScore = match.inning1.totalScore + 1; // Second team needs 1 more run than the first team's score

        // Set initial state for the second inning
        match.inning2 = {
            battingTeam: match.inning1.bowlingTeam,
            bowlingTeam: match.inning1.battingTeam,
            currentBatsmen: match.inning1.bowlingTeam.players.slice(0, 2), // Set the first two players as current batsmen
            currentOverBalls: 0,
            currentOvers: 0,
            totalScore: 0,
            wicketsFallen: 0,
            isInningComplete: false
        };
    };

    // Update Score Route

    const {
        runs,
        isWide,
        isNoBall,
        isLegBye,
        isBye,
        isWicket,
        outMethod,
        caughtBy,
        bowlerName
    } = req.body;
    const match = await MatchModel.findOne(); // Fetch the current match

    // Determine which inning we are in
    const currentInning =
        match.currentInning === 1 ? match.inning1 : match.inning2;

    // If it's the second inning, check if the match is over (target reached or all balls bowled or all wicket fall)
    if (match.currentInning === 2) {
        if (currentInning.totalScore >= match.targetScore) {
            match.status = `${match.currentInning.battingTeam} won by ${
                10 - match.currentInning.wicketsFallen
            } wickets`;
            return res.status(400).json({
                message: "Match over, batting team won"
            });
        }
        if (
            currentInning.remainingBalls <= 0 ||
            currentInning.wicketsFallen >= 10
        ) {
            match.status = `${match.currentInning.bowlingTeam} won by ${
                match.targetScore - match.currentInning.totalScore
            }`;
            return res.status(400).json({
                message: "Match over, bowling team won"
            });
        }
    }

    // Regular ball processing (not a wide, no-ball, leg-bye, or bye)
    if (!isWide && !isNoBall && !isLegBye && !isBye) {
        currentInning.currentBatsmen.forEach(batsman => {
            if (batsman.onStrike) {
                batsman.runs += runs;
                batsman.balls += 1;

                // Update boundary stats
                if (runs === 4) batsman.fours += 1;
                if (runs === 6) batsman.sixes += 1;
            }
        });

        currentInning.totalScore += runs;
        currentInning.currentOverBalls += 1;

        // Update remaining balls and runs required only in the second inning
    } else {
        // Handle extras
        if (isWide) {
            currentInning.totalScore += 1 + runs;
        }

        if (isNoBall) {
            currentInning.totalScore += 1;
            currentInning.currentBatsmen.forEach(batsman => {
                if (batsman.onStrike) {
                    batsman.runs += runs;
                }
            });
            currentInning.totalScore += runs;
        }

        if (isLegBye || isBye) {
            currentInning.totalScore += runs;

            currentInning.currentOverBalls += 1;
        }
    }

    // Handle wickets
    if (isWicket) {
        if (outMethod === "runoutOnStrikeEnd") {
            const strikeBatsman = currentInning.currentBatsmen.find(
                b => b.onStrike
            );
            strikeBatsman.isOut = true;
            strikeBatsman.outMethod = outMethod;
            strikeBatsman.caughtBy = caughtBy;
            currentInning.wicketsFallen += 1;
        }

        if (outMethod === "runoutOnNonStrikeEnd") {
            const nonStrikeBatsman = currentInning.currentBatsmen.find(
                b => b.onStrike === false
            );
            nonStrikeBatsman.isOut = true;
            nonStrikeBatsman.outMethod = outMethod;
            nonStrikeBatsman.caughtBy = caughtBy;
            currentInning.wicketsFallen += 1;
        }

        const batsman = currentInning.currentBatsmen.find(b => b.onStrike);
        if (!outMethod.startsWith("runout") && batsman) {
            batsman.isOut = true;
            batsman.outMethod = outMethod;
            batsman.caughtBy = caughtBy;
            currentInning.wicketsFallen += 1;

            // Move to the next batsman
            const nextBatsman = currentInning.battingTeam.players.find(
                p => !p.isOut && !currentInning.currentBatsmen.includes(p)
            );
            if (nextBatsman) {
                currentInning.currentBatsmen.push(nextBatsman);
                currentInning.currentBatsmen[0].onStrike = true; // The new batsman is on strike
            }
        }
    }

    // Update bowler's stats
    const bowler = currentInning.currentBowler;

    if (bowler) {
        if (!isNoBall && !isWide) {
            bowler.ballsBowled += 1;
        }
        bowler.runsConceded += runs;
        if (
            isWicket &&
            currentInning.outMethod !== "hitwicket" &&
            !currentInning.outMethod.startsWith("runout")
        ) {
            bowler.wickets += 1;
        }
    }

    // Switch strike on odd runs unless it's the last ball of the over
    if (runs % 2 !== 0 && !isWide && !isNoBall && !isLegBye && !isBye) {
        currentInning.currentBatsmen.forEach(
            batsman => (batsman.onStrike = !batsman.onStrike)
        );
    }

    // Update overs and handle end of over
    if (currentInning.currentOverBalls === 6) {
        currentInning.currentOvers += 1;
        currentInning.currentOverBalls = 0;

        // Only switch strike at the end of the over if the last ball was an even run
        if (runs % 2 === 0) {
            currentInning.currentBatsmen.forEach(
                batsman => (batsman.onStrike = !batsman.onStrike)
            );
        }
    }

    // Check if the first inning is over (10 wickets or 20 overs)
    if (
        currentInning.wicketsFallen >= 10 ||
        currentInning.currentOvers >= currentInning.totalOvers
    ) {
        if (match.currentInning === 1) {
            currentInning.isInningComplete = true;
            switchInnings(match); // Switch to the second inning
        } else {
            res.json({
                message: "Match over, second inning complete!"
            });
        }
    }

    await match.save();

    // Prepare the response
    const response = {
        match
    };

    // Add target and remaining balls to the response if it's the second inning
    if (match.currentInning === 2) {
        response.target = match.targetScore;
        response.runsRequired = match.targetScore - currentInning.totalScore;
        response.remainingBalls =
            currentInning.totalOvers -
            currentInning.currentOvers * 6 -
            currentOverBalls;
    }

    res.status(200).json(new ApiResponse(200, response));
});

const getSingleMatchDetailsController = asyncHandler(async (req, res) => {
    const matchId = req.params.id;
    const matchDetails = await MatchModel.findById(matchId);

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
    updateScoreController,
    getAllTeamsController,
    getSingleTeamController,
    getSingleMatchDetailsController
};
