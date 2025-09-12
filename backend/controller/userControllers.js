import express from "express";
import jwt from "jsonwebtoken";
import {
  asyncHandler
} from "../utility/asyncHandler.js";
import {
  ApiError
} from "../utility/ApiError.js";
import {
  ApiResponse
} from "../utility/ApiResponse.js";
import {
  createInning,
  getCurrentInning,
  shouldShowSummary
} from "../utility/matchUtils.js";
import {
  SignupModel
} from "../models/signup.js";
import {
  TeamModel
} from "../models/team.js";
import {
  MatchModel
} from "../models/match.js";
import {
  uploadToCloudinary,
  removeFromCloudinary
} from "../utility/cloudinary.js";
import {
  OAuth2Client
} from "google-auth-library";
import {
  io
} from "../app.js";
const generateAccessAndRefreshToken = async userId => {
  const user = await SignupModel.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refresh_token = refreshToken;

  await user.save({
    validateBeforeSave: false
  });
  return {
    accessToken,
    refreshToken
  };
};

const loginController = asyncHandler(async (req, res) => {
  const authCode = req.body.authCode;

  //making new OAuth client
  const client = new OAuth2Client( {
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

  const {
    id_token
  } = tokenResponse.tokens;

  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: process.env.OAUTH2_CLIENT_ID
  });

  const payload = ticket.getPayload();

  const {
    name,
    email,
    picture,
    sub
  } = payload;

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

    const {
      accessToken,
      refreshToken
    } =
    await generateAccessAndRefreshToken(existingUser._id);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken, refreshToken
        },
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

    const {
      accessToken,
      refreshToken
    } =
    await generateAccessAndRefreshToken(user._id);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken, refreshToken
        },
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
      {
        accessToken
      },
      "access token refresh succesfully"
    )
  );
});

const checkAuthController = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user));
});

const addNewTeamController = asyncHandler(async (req, res) => {
  const {
    teamName,
    city,
    captainName
  } = req.body;
  const user = req.user;
  const isEmpty = [teamName,
    city].some(field => {
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
  const teams = await TeamModel.find({
    createdBy: user._id
  });

  if (!teams) {
    throw new ApiError(404, "no teams has been found");
  }
  res.status(200).json(new ApiResponse(200, teams));
});

const getSingleTeamController = asyncHandler(async (req, res) => {
  const user = req.user;
  const teamId = req.params.teamId;
  const team = await TeamModel.findOne({
    _id: teamId, createdBy: user._id
  });

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

  const team = await TeamModel.findOne({
    _id: teamId, createdBy: user._id
  });

  if (!team) {
    throw new ApiError(404, "no team has been found");
  }

  team.players = [...team.players,
    ...parsedPlayers];

  const updatedTeam = await team.save();

  if (!updatedTeam) {
    throw new ApiError(500, "unexpected error occured try again latter !");
  }

  res.status(200).json(
    new ApiResponse(200, updatedTeam, "players added Successfully")
  );
});

const createMatchController = asyncHandler(async (req, res) => {
  const {
    teamA,
    teamB,
    totalOvers,
    matchPlace,
    matchStage,
    startTime,
  } = req.body;

  const user = req.user;

  const isEmpty = [
    teamA.id,
    teamB.id,
    teamA.name,
    teamB.name,
    teamA.playing11,
    teamB.playing11,
    teamA.captain.name,
    teamB.captain.captainId,
    totalOvers,
    matchPlace.city,
    matchPlace.ground,
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
      teamId: null,
      name: null,
      playing11: null,
      captain: null
    },
    bowlingTeam: {
      teamId: null,
      name: null,
      playing11: null,
      captain: null
    },
    totalOvers
  };

  const match = new MatchModel( {
    inning1: initialInningDetails,
    inning2: initialInningDetails,
    teamA: {
      teamId: teamA.id,
      name: teamA.name,
      playing11: teamA.playing11,
      captain: teamA.captain
    },
    teamB: {
      teamId: teamB.id,
      name: teamB.name,
      playing11: teamB.playing11,
      captain: teamB.captain
    },
    matchPlace,
    matchStage,
    startTime,
    createdBy: user._id
  });

  await match.save();

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
  const {
    tossWinner,
    tossDecision
  } = req.body;
  const user = req.user;
  const matchId = req.params.matchId;

  const isEmpty = [tossWinner,
    tossDecision].some(field => {
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

  let battingTeam,
  bowlingTeam;

  if (tossDecision === "bat") {
    battingTeam =
    tossWinner === match.teamA.name ? match.teamA: match.teamB;
    bowlingTeam =
    tossWinner === match.teamA.name ? match.teamB: match.teamA;
  } else if (tossDecision === "ball") {
    bowlingTeam =
    tossWinner === match.teamA.name ? match.teamA: match.teamB;
    battingTeam =
    tossWinner === match.teamA.name ? match.teamB: match.teamA;
  }
  const batsmanInitialStats = {
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false
  };

  const bowlerInitialStats = {
    ballsBowled: 0,
    wickets: 0,
    overs: 0,
    runsConceded: 0
  };

  match.inning1.battingTeam = {
    ...battingTeam,
    playing11: battingTeam.playing11.map(player => ({
      ...player,
      ...batsmanInitialStats
    }))
  };

  match.inning1.bowlingTeam = {
    ...bowlingTeam,
    playing11: bowlingTeam.playing11.map(player => ({
      ...player,
      ...bowlerInitialStats
    }))
  };

  match.inning2.battingTeam = {
    ...bowlingTeam,
    playing11: bowlingTeam.playing11.map(player => ({
      ...player,
      ...batsmanInitialStats
    }))
  };
  match.inning2.bowlingTeam = {
    ...battingTeam,
    playing11: battingTeam.playing11.map(player => ({
      ...player,
      ...bowlerInitialStats
    }))
  };

  match.matchStatus = "toss happend";
  match.toss.tossWinner = tossWinner;
  match.toss.tossDecision = tossDecision;
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "toss details updated successfully")
  );
});

const updateInitialPlayersController = asyncHandler(async (req, res) => {
  const {
    strikeBatsmanId,
    nonStrikeBatsmanId,
    currentBowlerId
  } = req.body;

  const user = req.user;
  const matchId = req.params.matchId;

  const isEmpty = [strikeBatsmanId,
    nonStrikeBatsmanId,
    currentBowlerId].some(
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

  const currentInning = getCurrentInning(match);

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

  currentInning.currentBatsmen = [{
    ...strikeBatsman.toObject(),
    onStrike: true
  },
    {
      ...nonStrikeBatsman.toObject(),
      onStrike: false
    }];

  currentInning.currentBowler = currentBowler;
  if (!match.isSuperOver) {
    if (match.currentInning === 1) {
      match.matchStatus = "in progress";
    }
    if (match.currentInning === 2) {
      match.matchStatus = "in progress";
      match.isInningChangePending = false;
      match.isSecondInningStarted = true;
    }
  } else {
    if (match.superOver.currentInning === 1) {
      match.isSuperOverInProgress = true;
    }
    if (match.superOver.currentInning === 2) {
      match.matchStatus = "super over";
      match.isSuperOverInProgress = true;
      match.isInningChangePending = false;
      match.isSecondInningStarted = true;
    }
  }

  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "initial player updated successfully")
  );
});

const updateScoreController = asyncHandler(async (req, res) => {
  const {
    runs,
    isFour,
    isSix,
    isWide,
    isNoball,
    isLegBye,
    isBye,
    isDeadBall,
    isWicket,
    outMethod,
    fielderId,
    outEnd
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

  const currentInning = getCurrentInning(match);

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
    if (!match.isSuperOver) {
      if (match.currentInning === 1) {
        if (
          match.inning1.wicketsFallen >= 10 ||
          match.inning1.currentOvers >= match.inning1.totalOvers
        ) {
          match.matchStatus = "inning break";

          match.currentInning = 2;

          match.targetScore = match.inning1.totalScore + 1;

          match.isInningChangePending = true;

          io.to(matchId).emit("inningCompleted");
        }
      } else {
        if (match.inning2.totalScore >= match.targetScore) {
          match.matchStatus = "completed";

          match.matchResult = {
            status: "Win",
            winningTeam: `${match.inning2.battingTeam.name}`,
            winningMargin: `${
            10 - match.inning2.wicketsFallen
            } wickets`
          };

          io.to(matchId).emit("matchCompleted");
        } else if (
          match.inning2.currentOvers >= match.inning2.totalOvers ||
          match.inning2.wicketsFallen >= 10
        ) {
          if (match.inning2.totalScore === match.targetScore - 1) {
            match.matchStatus = "completed";

            match.matchResult = {
              status: "Tie",
              winningTeam: null,
              winningMargin: null
            };

            io.to(matchId).emit("matchTied");
          } else {
            match.matchStatus = "completed";

            match.matchResult = {
              status: "Win",
              winningTeam: `${match.inning2.bowlingTeam.name}`,
              winningMargin: `${
              match.targetScore - match.inning2.totalScore
              } runs`
            };
            io.to(matchId).emit("matchCompleted");
          }
        }
      }
    } else {
      if (match.superOver.currentInning === 1) {
        if (
          match.superOver.inning1.wicketsFallen >= 2 ||
          match.superOver.inning1.currentOvers >=
          match.superOver.inning1.totalOvers
        ) {
          match.matchStatus = "inning break";
          match.isSuperOverInProgress = false;
          match.superOver.currentInning = 2;

          match.superOver.targetScore =
          match.superOver.inning1.totalScore + 1;
          match.isInningChangePending = true;

          io.to(matchId).emit("inningCompleted");
        }
      } else {
        if (
          match.superOver.inning2.totalScore >=
          match.superOver.targetScore
        ) {
          match.matchStatus = "completed";
          match.isSuperOverInProgress = false;
          match.matchResult = {
            status: "Super Over",
            winningTeam: `${match.superOver.inning2.battingTeam.name}`,
            winningMargin: null
          };

          io.to(matchId).emit("matchCompleted");
        } else if (
          match.superOver.inning2.currentOvers >=
          match.superOver.inning2.totalOvers ||
          match.superOver.inning2.wicketsFallen >= 2
        ) {
          if (
            match.superOver.inning2.totalScore ===
            match.superOver.targetScore - 1
          ) {
            match.matchStatus = "completed";
            match.isSuperOverInProgress = false;
            match.matchResult = {
              status: "Super Over Tie",
              winningTeam: null,
              winningMargin: null
            };

            io.to(matchId).emit("superOverTied");
          } else {
            match.matchStatus = "completed";
            match.isSuperOverInProgress = false;
            match.matchResult = {
              status: "Super Over",
              winningTeam: `${match.superOver.inning2.bowlingTeam.name}`,
              winningMargin: null
            };

            io.to(matchId).emit("matchCompleted");
          }
        }
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
    if (isFour) {
      strikeBatsman.fours += 1;
      batter.fours += 1;
    }
    if (isSix) {
      strikeBatsman.sixes += 1;
      batter.sixes += 1;
    }
    // Update player stats in the team as well

    currentBowler.ballsBowled += 1;
    currentBowler.runsConceded += runs;
    bowler.ballsBowled += 1;
    bowler.runsConceded += runs;

    if (isWicket) {
      if (outMethod === "run out" && outEnd === "striker") {
        strikeBatsman.isOut = true;
        strikeBatsman.outMethod = outMethod;
        strikeBatsman.caughtBy = currentFielder.name;
        batter.isOut = true;
        batter.outMethod = outMethod;
        batter.caughtBy = currentFielder.name;
        currentInning.wicketsFallen += 1;
      } else if (outMethod === "run out" && outEnd === "nonStriker") {
        nonStrikeBatsman.isOut = true;
        nonStrikeBatsman.outMethod = outMethod;
        nonStrikeBatsman.caughtBy = currentFielder.name;
        batter.isOut = true;
        batter.outMethod = outMethod;
        batter.caughtBy = currentFielder.name;
        currentInning.wicketsFallen += 1;
      } else if (outMethod === "retired hurt" && outEnd === "striker") {
        strikeBatsman.isOut = true;
        strikeBatsman.outMethod = outMethod;
        batter.outMethod = outMethod;
      } else if (
        outMethod === "retired hurt" &&
        outEnd === "nonStriker"
      ) {
        nonStrikeBatsman.isOut = true;
        nonStrikeBatsman.outMethod = outMethod;
        batter.outMethod = outMethod;
      } else if (outMethod === "retired out" && outEnd === "striker") {
        strikeBatsman.isOut = true;
        batter.isOut = true;
        strikeBatsman.outMethod = outMethod;
        batter.outMethod = outMethod;
        currentInning.wicketsFallen += 1;
      } else if (outMethod === "retired out" && outEnd === "nonStriker") {
        nonStrikeBatsman.isOut = true;
        batter.isOut = true;
        nonStrikeBatsman.outMethod = outMethod;
        batter.outMethod = outMethod;
        currentInning.wicketsFallen += 1;
      } else {
        strikeBatsman.isOut = true;
        strikeBatsman.outMethod = outMethod;
        strikeBatsman.caughtBy = currentFielder?.name;
        strikeBatsman.dismissBy = currentBowler.name;
        batter.isOut = true;
        batter.outMethod = outMethod;
        batter.caughtBy = currentFielder?.name;
        batter.dismissBy = currentBowler.name;
        currentInning.wicketsFallen += 1;
        currentBowler.wickets += 1;
        bowler.wickets += 1;
      }
      const isLastBall =
      currentInning.currentOvers === currentInning.totalOvers - 1 &&
      currentInning.currentOverBalls === 6;
      if (!isLastBall && currentInning.wicketsFallen !== 10) {
        if (!match.isSuperOver) {
          if (
            match.currentInning === 2 &&
            match.inning2.totalScore !== match.targetScore
          ) {
            match.iSelectNewBatsmanPending = true;
            io.to(matchId).emit("wicketFallen");
          } else {
            match.isSelectNewBatsmanPending = true;
            io.to(matchId).emit("wicketFallen");
          }
        } else {
          if (
            match.superOver.currentInning === 2 &&
            match.superOver.inning2.totalScore !==
            match.superOver.targetScore
          ) {
            match.isSelectNewBatsmanPending = true;
            io.to(matchId).emit("wicketFallen");
          } else {
            match.isSelectNewBatsmanPending = true;
            io.to(matchId).emit("wicketFallen");
          }
        }
      }
    }

    currentInning.currentOverTimeline.push({
      overNumber: currentInning.currentOvers,
      ballNumber: currentInning.currentOverBalls,
      runs,
      isFour,
      isSix,
      isWide,
      isNoball,
      isLegBye,
      isBye,
      isDeadBall,
      isWicket,
      outMethod,
      currentBowlerId: currentBowler._id,
      strikeBatsmanId: strikeBatsman._id,
      nonStrikeBatsmanId: nonStrikeBatsman._id
    });
  };

  // Helper function to handle extras (wide, no-ball, leg-bye, bye)
  const updateExtras = () => {
    if (isLegBye || isBye) {
      currentInning.totalScore += runs;
      currentInning.currentOverBalls += 1;
      strikeBatsman.balls += 1;
      batter.balls += 1;

      currentBowler.ballsBowled += 1;
      bowler.ballsBowled += 1;
    } else if (isNoball) {
      currentInning.totalScore += 1 + runs;
      strikeBatsman.runs += runs;

      batter.runs += runs;

      if (isFour) {
        strikeBatsman.fours += 1;
        batter.fours += 1;
      }
      if (isSix) {
        strikeBatsman.sixes += 1;
        batter.sixes += 1;
      }

      currentBowler.runsConceded += 1 + runs;
      bowler.runsConceded += 1 + runs;
    } else if (isWide) {
      currentInning.totalScore += 1 + runs;
      currentBowler.runsConceded += 1 + runs;
      bowler.runsConceded += 1 + runs;
    }

    if (isWicket) {
      if (outMethod === "runout" && outEnd === "striker") {
        strikeBatsman.isOut = true;
        strikeBatsman.outMethod = outMethod;
        strikeBatsman.caughtBy = currentFielder.name;
        batter.isOut = true;
        batter.outMethod = outMethod;
        batter.caughtBy = currentFielder.name;
        currentInning.wicketsFallen += 1;
      } else if (outMethod === "runout" && outEnd === "nonStriker") {
        nonStrikeBatsman.isOut = true;
        nonStrikeBatsman.outMethod = outMethod;
        nonStrikeBatsman.caughtBy = currentFielder.name;
        batter.isOut = true;
        batter.outMethod = outMethod;
        batter.caughtBy = currentFielder.name;
        currentInning.wicketsFallen += 1;
      } else if (outMethod === "retired hurt" && outEnd === "striker") {
        strikeBatsman.isOut = true;
        strikeBatsman.outMethod = outMethod;
        batter.outMethod = outMethod;
      } else if (
        outMethod === "retired hurt" &&
        outEnd === "nonStriker"
      ) {
        nonStrikeBatsman.isOut = true;
        nonStrikeBatsman.outMethod = outMethod;
        batter.outMethod = outMethod;
      } else if (outMethod === "retired out" && outEnd === "striker") {
        strikeBatsman.isOut = true;
        batter.isOut = true;
        strikeBatsman.outMethod = outMethod;
        batter.outMethod = outMethod;
        currentInning.wicketsFallen += 1;
      } else if (outMethod === "retired out" && outEnd === "nonStriker") {
        nonStrikeBatsman.isOut = true;
        batter.isOut = true;
        nonStrikeBatsman.outMethod = outMethod;
        batter.outMethod = outMethod;
        currentInning.wicketsFallen += 1;
      } else {
        strikeBatsman.isOut = true;
        strikeBatsman.outMethod = outMethod;
        strikeBatsman.caughtBy = currentFielder?.name;
        strikeBatsman.dismissBy = currentBowler.name;
        batter.isOut = true;
        batter.outMethod = outMethod;
        batter.caughtBy = currentFielder?.name;
        batter.dismissBy = currentBowler.name;
        currentInning.wicketsFallen += 1;
        currentBowler.wickets = +1;
        bowler.wickets = +1;
      }
      const isLastBall =
      currentInning.currentOvers === currentInning.totalOvers - 1 &&
      currentInning.currentOverBalls === 6;
      if (!isLastBall && currentInning.wicketsFallen !== 10) {
        if (!match.isSuperOver) {
          if (
            match.currentInning === 2 &&
            match.inning2.totalScore !== match.targetScore
          ) {
            match.isSelectNewBatsmanPending = true;
            io.to(matchId).emit("wicketFallen");
          } else {
            match.isSelectNewBatsmanPending = true;
            io.to(matchId).emit("wicketFallen");
          }
        } else {
          if (
            match.superOver.currentInning === 2 &&
            match.superOver.inning2.totalScore !==
            match.superOver.targetScore
          ) {
            match.isSelectNewBatsmanPending = true;
            io.to(matchId).emit("wicketFallen");
          } else {
            match.isSelectNewBatsmanPending = true;
            io.to(matchId).emit("wicketFallen");
          }
        }
      }
    }

    currentInning.currentOverTimeline.push({
      overNumber: currentInning.currentOvers,
      ballNumber: currentInning.currentOverBalls,
      runs,
      isFour,
      isSix,
      isWide,
      isNoball,
      isLegBye,
      isBye,
      isDeadBall,
      isWicket,
      outMethod,
      currentBowlerId: currentBowler._id,
      strikeBatsmanId: strikeBatsman._id,
      nonStrikeBatsmanId: nonStrikeBatsman._id
    });
  };

  // Helper function to switch strike
  const switchStrike = () => {
    if (runs % 2 !== 0) {
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
        if (!match.isSuperOver) {
          if (match.currentInning === 2) {
            if (match.inning2.totalScore !== match.targetScore) {
              match.isOverChangePending = true;
              io.to(matchId).emit("overCompleted");
            }
          } else {
            match.isOverChangePending = true;
            io.to(matchId).emit("overCompleted");
          }
        } else {
          if (match.superOver.currentInning === 2) {
            if (
              match.superOver.inning2.totalScore !==
              match.superOver.targetScore
            ) {
              match.isOverChangePending = true;
              io.to(matchId).emit("overCompleted");
            }
          } else {
            match.isOverChangePending = true;
            io.to(matchId).emit("overCompleted");
          }
        }
      }
    }
  };

  // Run updates based on the type of ball

  if (!isWide && !isNoball && !isLegBye && !isBye && !isDeadBall) {
    updateRegularBall();
  } else {
    updateExtras();
  }

  switchStrike();
  endOver();
  checkGameProgress();

  io.to(matchId).emit("scoreUpdated", {
    match
  });

  if (shouldShowSummary(match, currentInning)) {
    io.to(matchId).emit("showSummary")
  }

  if (shouldShowHighlightEvent(isFour, isSix, isWicket)) {
    io.to(matchId).emit("showHighlightEvent", {
      isFour, isSix, isWicket
    })
  }
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
  const {
    newBowlerId
  } = req.body;
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

  const currentInning = getCurrentInning(match);

  const newBowler = currentInning.bowlingTeam.playing11.find(player =>
    player._id.equals(newBowlerId)
  );

  currentInning.currentBowler = newBowler;
  match.isOverChangePending = false;
  if (currentInning.currentOverBalls === 0) {
    currentInning.currentOverTimeline = [];
  }
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "bowler changed successfully")
  );
});

const updateOutBatsmanController = asyncHandler(async (req, res) => {
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

  const currentInning = getCurrentInning(match);

  const battingTeam = currentInning.battingTeam;

  const newBatsman = battingTeam.playing11.find(player =>
    player._id.equals(newBatsmanId)
  );

  const outBatsman = currentInning.currentBatsmen.find(
    batsman => batsman.isOut
  );

  const updatedCurrentBatsmen = currentInning.currentBatsmen.map(batsman =>
    batsman.isOut
    ? {
      ...newBatsman.toObject(), onStrike: outBatsman.onStrike
    }: batsman
  );

  currentInning.currentBatsmen = updatedCurrentBatsmen;

  match.isSelectNewBatsmanPending = false;
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "batsman changed successfully")
  );
});

const changeBatsmanController = asyncHandler(async (req, res) => {
  const {
    replacedBatsmanId,
    newBatsmanId
  } = req.body;
  const user = req.user;
  const matchId = req.params.matchId;

  if (!replacedBatsmanId || !newBatsmanId) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  const currentInning = getCurrentInning(match);

  const battingTeam = currentInning.battingTeam;

  const replacedBatsman = currentInning.currentBatsmen.find(player =>
    player._id.equals(replacedBatsmanId)
  );

  const newBatsman = battingTeam.playing11.find(player =>
    player._id.equals(newBatsmanId)
  );

  if (!replacedBatsman || !newBatsman) {
    throw new ApiError(404, "Batsman not found");
  }

  const updatedBatsman = {
    ...newBatsman.toObject(),
    _id: replacedBatsman._id,
    runs: replacedBatsman.runs,
    balls: replacedBatsman.balls,
    fours: replacedBatsman.fours,
    sixes: replacedBatsman.sixes,
    onStrike: replacedBatsman.onStrike
  };

  currentInning.currentBatsmen = currentInning.currentBatsmen.map(batsman =>
    batsman._id.equals(replacedBatsman._id) ? updatedBatsman: batsman
  );

  battingTeam.playing11 = battingTeam.playing11.map(player => {
    if (player._id.equals(newBatsmanId)) {
      return {
        ...player.toObject(),
        _id: replacedBatsman._id,
        runs: replacedBatsman.runs,
        balls: replacedBatsman.balls,
        fours: replacedBatsman.fours,
        sixes: replacedBatsman.sixes
      };
    } else if (player._id.equals(replacedBatsmanId)) {
      return {
        ...player.toObject(),
        _id: newBatsman._id,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0
      };
    }
    return player;
  });

  match.isSelectNewBatsmanPending = false;
  io.to(matchId).emit("scoreUpdated",
    {
      match
    });
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "Batsman changed successfully")
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

  const currentInning = getCurrentInning(match);

  currentInning.currentBatsmen = currentInning.currentBatsmen.map(batsmen => {
    return {
      ...batsmen, onStrike: !batsmen.onStrike
    };
  });
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "bowler changed successfully")
  );
});

const replacePlayerController = asyncHandler(async (req, res) => {
  const {
    replacedPlayerId,
    newPlayerId,
    teamId
  } = req.body;
  const user = req.user;
  const matchId = req.params.matchId;

  if (!replacedPlayerId || !newPlayerId || !teamId) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // Find the team details
  const teamDetails = await TeamModel.findOne({
    _id: teamId,
    createdBy: user._id
  });

  if (!teamDetails) {
    throw new ApiError(404, "team not found");
  }

  // Get the new player details
  const newPlayer = teamDetails.players.find(
    player => player.playerId.toString() === newPlayerId
  );

  if (!newPlayer) {
    throw new ApiError(404, "new player not found in team");
  }

  // Find the match details
  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "match not found");
  }

  // Check replaced player exist in playing11
  const isReplacedPlayerExist = team =>
  team.playing11.some(
    player => player.playerId.toString() === replacedPlayerId
  );

  if (
    match.teamA.teamId.toString() === teamId &&
    !isReplacedPlayerExist(match.teamA)
  ) {
    throw new ApiError(400, "replaced player not found in the playing 11");
  } else if (
    match.teamB.teamId.toString() === teamId &&
    !isReplacedPlayerExist(match.teamB)
  ) {
    throw new ApiError(400, "replaced player not found in the playing 11");
  }

  // Check if the new player is already in the playing 11
  const isNewPlayerAlreadyInPlaying11 = team =>
  team.playing11.some(
    player => player.playerId.toString() === newPlayerId
  );

  if (
    match.teamA.teamId.toString() === teamId &&
    isNewPlayerAlreadyInPlaying11(match.teamA)
  ) {
    throw new ApiError(400, "new player is already in the playing 11");
  } else if (
    match.teamB.teamId.toString() === teamId &&
    isNewPlayerAlreadyInPlaying11(match.teamB)
  ) {
    throw new ApiError(400, "new player is already in the playing 11");
  }

  // Replace player in teamA or teamB
  const replacePlayerInTeam = playing11 => {
    playing11 = playing11.map(player =>
      player.playerId.toString() === replacedPlayerId ? newPlayer: player
    );
    return playing11;
  };

  if (match.teamA.teamId.toString() === teamId) {
    match.teamA.playing11 = replacePlayerInTeam(match.teamA.playing11);
  } else if (match.teamB.teamId.toString() === teamId) {
    match.teamB.playing11 = replacePlayerInTeam(match.teamB.playing11);
  } else {
    throw new ApiError(400, "Team not part of this match");
  }

  // Update player in both innings (batting and bowling teams)
  let newBatsmanData;
  let newBowlerData;
  const replacePlayerInInning = inning => {
    if (inning.battingTeam.teamId.toString() === teamId) {
      const replacedPlayer = inning.battingTeam.playing11.find(player =>
        player.playerId.equals(replacedPlayerId)
      );

      newBatsmanData = {
        ...newPlayer.toObject(),
        _id: replacedPlayer._id,
        runs: replacedPlayer.runs,
        balls: replacedPlayer.balls,
        fours: replacedPlayer.fours,
        sixes: replacedPlayer.sixes,
        isOut: replacedPlayer.isOut
      };

      inning.battingTeam.playing11 = inning.battingTeam.playing11.map(
        player =>
        player.playerId.toString() === replacedPlayerId
        ? newBatsmanData: player
      );
    }
    if (inning.bowlingTeam.teamId.toString() === teamId) {
      const replacedPlayer = inning.bowlingTeam.playing11.find(player =>
        player.playerId.equals(replacedPlayerId)
      );

      newBowlerData = {
        ...newPlayer.toObject(),
        _id: replacedPlayer._id,
        ballsBowled: replacedPlayer.ballsBowled,
        wickets: replacedPlayer.wickets,
        overs: replacedPlayer.overs,
        runsConceded: replacedPlayer.runsConceded
      };

      inning.bowlingTeam.playing11 = inning.bowlingTeam.playing11.map(
        player =>
        player.playerId.toString() === replacedPlayerId
        ? newBowlerData: player
      );
    }
  };

  replacePlayerInInning(match.inning1);
  replacePlayerInInning(match.inning2);

  // Replace in current batsmen
  const replacePlayerInBatsmen = inning => {
    const isCurrentBatsman = inning.currentBatsmen?.some(
      batsman => batsman.playerId.toString() === replacedPlayerId
    );

    if (isCurrentBatsman) {
      inning.currentBatsmen = inning.currentBatsmen.map(batsman =>
        batsman.playerId.toString() === replacedPlayerId
        ? {
          ...newBatsmanData, onStrike: batsman.onStrike
        }: batsman
      );
    }
  };

  replacePlayerInBatsmen(match.inning1);
  replacePlayerInBatsmen(match.inning2);

  // Replace in current bowler
  const replacePlayerInBowler = inning => {
    const isCurrentBowler =
    inning.currentBowler?.playerId.toString() === replacedPlayerId;

    if (isCurrentBowler) {
      inning.currentBowler = newBowlerData;
    }
  };

  replacePlayerInBowler(match.inning1);
  replacePlayerInBowler(match.inning2);

  // Save changes
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();
  res.status(200).json(
    new ApiResponse(200, match, "player replaced successfully")
  );
});

const changeCaptainController = asyncHandler(async (req, res) => {
  const {
    teamId,
    captainId
  } = req.body;
  const user = req.user;
  const matchId = req.params.matchId;

  if (!captainId || !teamId) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // Find the match details
  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // Check if the new player is already in the playing 11
  const isPlayerAlreadyCaptain = team =>
  team.captain.captainId.equals(captainId);

  if (
    match.teamA.teamId.toString() === teamId &&
    isPlayerAlreadyCaptain(match.teamA)
  ) {
    throw new ApiError(400, " player is already captain");
  }

  if (
    match.teamB.teamId.toString() === teamId &&
    isPlayerAlreadyCaptain(match.teamB)
  ) {
    throw new ApiError(400, " player is already captain");
  }

  let captainDetails;
  if (match.teamA.teamId.toString() === teamId) {
    captainDetails = match.teamA.playing11.find(player =>
      player.playerId.equals(captainId)
    );
  } else if (match.teamB.teamId.toString() === teamId) {
    captainDetails = match.teamB.playing11.find(player =>
      player.playerId.equals(captainId)
    );
  }

  // Replace player in teamA or teamB
  const changeCaptainInTeam = team => {
    team.captain.captainId = captainDetails.playerId;
    team.captain.name = captainDetails.name;
  };

  if (match.teamA.teamId.toString() === teamId) {
    changeCaptainInTeam(match.teamA);
  } else if (match.teamB.teamId.toString() === teamId) {
    changeCaptainInTeam(match.teamB);
  } else {
    throw new ApiError(400, "Team not part of this match");
  }

  // change captain in both innings (batting and bowling team)
  const changeCaptainInInning = inning => {
    if (inning.battingTeam.teamId.toString() === teamId) {
      inning.battingTeam.captain.captainId = captainDetails.playerId;
      inning.battingTeam.captain.name = captainDetails.name;
    }
    if (inning.bowlingTeam.teamId.toString() === teamId) {
      inning.bowlingTeam.captain.captainId = captainDetails.playerId;
      inning.bowlingTeam.captain.name = captainDetails.name;
    }
  };

  changeCaptainInInning(match.inning1);
  changeCaptainInInning(match.inning2);

  io.to(matchId).emit("scoreUpdated", {
    match
  });
  // Save changes
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "captain changed successfully")
  );
});

const addSubstitutesController = asyncHandler(async (req, res) => {
  const {
    teamId,
    playerId
  } = req.body;
  const user = req.user;
  const matchId = req.params.matchId;

  if (!matchId || !playerId || !teamId) {
    throw new ApiError(400, "please provide all required fields");
  }

  // Find the match details
  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "match not found");
  }

  // Check if the player is already in the substitutes
  const isPlayerAlreadyInSubstitutes = team =>
  team.substitutes.some(substitute =>
    substitute.playerId.equals(playerId)
  );

  if (
    match.teamA.teamId.toString() === teamId &&
    isPlayerAlreadyInSubstitutes(match.teamA)
  ) {
    throw new ApiError(400, " player is already in substitutes");
  } else if (
    match.teamB.teamId.toString() === teamId &&
    isPlayerAlreadyInSubstitutes(match.teamB)
  ) {
    throw new ApiError(400, " player is already in substitutes");
  }

  // Find the team details
  const team = await TeamModel.findOne({
    _id: teamId,
    createdBy: user._id
  });

  if (!team) {
    throw new ApiError(404, "team not found");
  }

  const player = team.players.find(player =>
    player.playerId.equals(playerId)
  );

  if (!player) {
    throw new ApiError(404, "player not found");
  }

  // add substitutes in teamA or teamB
  const addSubstituteInTeam = team => {
    team.substitutes.push(player);
  };

  if (match.teamA.teamId.toString() === teamId) {
    addSubstituteInTeam(match.teamA);
  } else if (match.teamB.teamId.toString() === teamId) {
    addSubstituteInTeam(match.teamB);
  } else {
    throw new ApiError(400, "Team not part of this match");
  }

  // add substitutes in both innings (batting and bowling team)
  const addSubstituteInInning = inning => {
    if (inning.battingTeam.teamId.toString() === teamId) {
      inning.battingTeam.substitutes.push(player);
    }
    if (inning.bowlingTeam.teamId.toString() === teamId) {
      inning.bowlingTeam.substitutes.push(player);
    }
  };

  addSubstituteInInning(match.inning1);
  addSubstituteInInning(match.inning2);

  io.to(matchId).emit("scoreUpdated", {
    match, squadDetails: team
  });
  // Save changes
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "player added in substitutes successfully")
  );
});

const removeSubstitutesController = asyncHandler(async (req, res) => {
  const {
    teamId,
    playerId
  } = req.body;
  const user = req.user;
  const matchId = req.params.matchId;

  if (!matchId || !playerId || !teamId) {
    throw new ApiError(400, "please provide all required fields");
  }

  // Find the match details
  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "match not found");
  }

  // Check if the player is already in the substitutes
  const isPlayerInSubstitutes = team =>
  team.substitutes.some(player => player.playerId.equals(playerId));

  if (
    match.teamA.teamId.toString() === teamId &&
    !isPlayerInSubstitutes(match.teamA)
  ) {
    throw new ApiError(400, " player not found in substitutes");
  } else if (
    match.teamB.teamId.toString() === teamId &&
    !isPlayerInSubstitutes(match.teamB)
  ) {
    throw new ApiError(400, " player not found in substitutes");
  }

  // Find the team details
  const team = await TeamModel.findOne({
    _id: teamId,
    createdBy: user._id
  });

  if (!team) {
    throw new ApiError(404, "team not found");
  }

  const player = team.players.find(player =>
    player.playerId.equals(playerId)
  );

  if (!player) {
    throw new ApiError(404, "player not found");
  }

  // add substitutes in teamA or teamB
  const removeSubstituteInTeam = team => {
    team.substitutes = team.substitutes.filter(
      substitute => !substitute.playerId.equals(player.playerId)
    );
  };

  if (match.teamA.teamId.toString() === teamId) {
    removeSubstituteInTeam(match.teamA);
  } else if (match.teamB.teamId.toString() === teamId) {
    removeSubstituteInTeam(match.teamB);
  } else {
    throw new ApiError(400, "team not part of this match");
  }

  // add substitutes in both innings (batting and bowling team)
  const removeSubstituteInInning = inning => {
    if (inning.battingTeam.teamId.toString() === teamId) {
      inning.battingTeam.substitutes =
      inning.battingTeam.substitutes.filter(
        substitute => !substitute.playerId.equals(player.playerId)
      );
    }
    if (inning.bowlingTeam.teamId.toString() === teamId) {
      inning.bowlingTeam.substitutes =
      inning.bowlingTeam.substitutes.filter(
        substitute => !substitute.playerId.equals(player.playerId)
      );
    }
  };

  removeSubstituteInInning(match.inning1);
  removeSubstituteInInning(match.inning2);

  io.to(matchId).emit("scoreUpdated", {
    match, squadDetails: team
  });
  // Save changes
  await match.save();

  res.status(200).json(
    new ApiResponse(
      200,
      match,
      "player removed from substitutes successfully"
    )
  );
});

//undo controller
const undoScoreController = asyncHandler(async (req, res) => {
  const matchId = req.params.matchId;
  const {
    lastAction,
    previousOverTimeline
  } = req.body;
  const user = req.user;

  if (!lastAction) {
    throw new ApiError(400, "no action to undo");
  }

  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "match not found");
  }



  if (!match.isSuperOver) {
    if (match.isInningChangePending && match.currentInning === 2) {
      match.currentInning = 1;
      match.isInningChangePending = false;
      match.targetScore = null;
      match.matchStatus = "in progress";
    }

    if (match.matchStatus === "completed" && match.currentInning === 2) {
      match.matchStatus = "in progress";

      match.matchResult = {
        status: null,
        winningTeam: null,
        winningMargin: null
      };
    }
  } else {
    if (
      match.isInningChangePending &&
      match.superOver.currentInning === 2
    ) {
      match.superOver.currentInning = 1;
      match.isInningChangePending = false;
      match.isSuperOverInProgress = true;
      match.superOver.targetScore = null;
      match.matchStatus = "super over";
    }

    if (
      match.matchStatus === "completed" &&
      match.superOver.currentInning === 2
    ) {
      match.matchStatus = "super over";
      match.isSuperOverInProgress = true;
      match.matchResult = {
        status: null,
        winningTeam: null,
        winningMargin: null
      };
    }
  }

  const currentInning = getCurrentInning(match);

  const strikeBatsman = currentInning.battingTeam.playing11.find(player =>
    player._id.equals(lastAction.strikeBatsmanId)
  );

  const nonStrikeBatsman = currentInning.battingTeam.playing11.find(player =>
    player._id.equals(lastAction.nonStrikeBatsmanId)
  );

  const currentBowler = currentInning.bowlingTeam.playing11.find(player =>
    player._id.equals(lastAction.currentBowlerId)
  );

  // Update total score
  currentInning.totalScore -=
  lastAction.isWide ||
  lastAction.isNoball
  ? 1 + lastAction.runs: lastAction.runs;

  //update batsman states
  strikeBatsman.runs -=
  lastAction.isWide ||
  lastAction.isLegBye ||
  lastAction.isBye ||
  lastAction.isDeadBall
  ? 0: lastAction.runs;

  strikeBatsman.balls -=
  lastAction.isWide || lastAction.isNoball || lastAction.isDeadBall
  ? 0: 1;

  if (lastAction.isFour) {
    strikeBatsman.fours -= 1;
  }
  if (lastAction.isSix) {
    strikeBatsman.sixes -= 1;
  }

  // Handle wicket undo
  if (lastAction.isWicket) {
    if (strikeBatsman.isOut) {
      strikeBatsman.isOut = false;
      strikeBatsman.outMethod = null;

      strikeBatsman.caughtBy = null;

      strikeBatsman.dismissBy = null;
    }

    if (nonStrikeBatsman.isOut) {
      nonStrikeBatsman.isOut = false;
      nonStrikeBatsman.outMethod = null;

      nonStrikeBatsman.caughtBy = null;

      nonStrikeBatsman.dismissBy = null;
    }

    if (lastAction.outMethod !== "retired hurt") {
      currentInning.wicketsFallen -= 1;
    }

    if (match.isSelectNewBatsmanPending) {
      match.isSelectNewBatsmanPending = false;
    }
  }

  currentInning.currentBatsmen = [{
    ...strikeBatsman.toObject(),
    onStrike: true
  },
    {
      ...nonStrikeBatsman.toObject(),
      onStrike: false
    }];

  //update bowler start
  currentBowler.runsConceded -=
  lastAction.isLegBye || lastAction.isBye || lastAction.isDeadBall
  ? 0: lastAction.isWide || lastAction.isNoball
  ? 1 + lastAction.runs: lastAction.runs;

  if (!lastAction.isWide && !lastAction.isNoball && !lastAction.isDeadBall) {
    currentBowler.ballsBowled -= 1;
    if (currentInning.currentOverBalls === 0) {
      currentInning.currentOvers -= 1;
      currentInning.currentOverBalls = 5;
      currentInning.currentOverTimeline = previousOverTimeline;
      if (match.isOverChangePending) {
        match.isOverChangePending = false;
      }
    } else {
      currentInning.currentOverBalls -= 1;
    }
  }

  if (
    lastAction.isWicket &&
    !lastAction.isNoball &&
    lastAction.outMethod !== "retired hurt" &&
    lastAction.outMethod !== "retired out"
  ) {
    currentBowler.wickets -= 1;
  }

  currentInning.currentBowler = currentBowler;

  currentInning.currentOverTimeline.pop();
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  if (shouldShowSummary(match, currentInning)) {
    io.to(matchId).emit("hideSummary")
  }
  if (shouldShowHighlightEvent(lastAction.isFour, lastAction.isSix, lastAction.isWicket)) {
    io.to(matchId).emit("hideHighlightEvent")
  }
  // Save the updated match
  await match.save();

  res.status(200).json(
    new ApiResponse(200, match, "last action undo successfully")
  );
});


const startSuperOverController = asyncHandler(async (req, res) => {
  const user = req.user;
  const matchId = req.params.matchId;
  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "no match has been found");
  }
  const totalOvers = 1;
  const batsmanStats = {
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false
  };

  const bowlerStats = {
    ballsBowled: 0,
    wickets: 0,
    overs: 0,
    runsConceded: 0
  };

  match.matchStatus = "super over";

  if (match.isSecondInningStarted) {
    match.isSecondInningStarted = false;
  }

  if (!match.isSuperOver) {
    match.isSuperOver = true;
    match.superOver = {
      inning1: createInning(
        match.inning2.bowlingTeam,
        match.inning2.battingTeam,
        batsmanStats,
        bowlerStats,
        totalOvers
      ),
      inning2: createInning(
        match.inning2.battingTeam,
        match.inning2.bowlingTeam,
        batsmanStats,
        bowlerStats,
        totalOvers
      ),
      currentInning: 1
    };
  } else {
    match.superOver = {
      inning1: createInning(
        match.superOver.inning2.bowlingTeam,
        match.superOver.inning2.battingTeam,
        batsmanStats,
        bowlerStats,
        totalOvers
      ),
      inning2: createInning(
        match.superOver.inning2.battingTeam,
        match.superOver.inning2.bowlingTeam,
        batsmanStats,
        bowlerStats,
        totalOvers
      ),
      currentInning: 1
    };
  }
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();
  res.status(200).json(new ApiResponse(200, match));
});

const endInningController = asyncHandler(async (req, res) => {
  const user = req.user;
  const matchId = req.params.matchId;
  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "no match has been found");
  }

  if (!match.isSuperOver) {
    match.currentInning = 2;
    match.targetScore = match.inning1.totalScore + 1;
  } else {
    match.superOver.currentInning = 2;
    match.superOver.targetScore = match.superOver.inning1.totalScore + 1;
  }
  match.isInningChangePending = true;
  match.matchStatus = "inning break";
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();
  res.status(200).json(new ApiResponse(200, match));
});

const endMatchController = asyncHandler(async (req, res) => {
  const {
    isMatchAbandoned,
    winningTeamId
  } = req.body;
  const user = req.user;
  const matchId = req.params.matchId;
  const match = await MatchModel.findOne({
    _id: matchId,
    createdBy: user._id
  });

  if (!match) {
    throw new ApiError(404, "no match has been found");
  }

  const currentInning = getCurrentInning(match);

  if (isMatchAbandoned) {
    match.matchStatus = "abandoned";
  } else {
    if (currentInning.battingTeam.teamId.equals(winningTeamId)) {
      match.matchStatus = "completed";
      if (!match.isSuperOver) {
        match.matchResult = {
          status: "Win",
          winningTeam: `${match.inning2.battingTeam.name}`,
          winningMargin: `${10 - match.inning2.wicketsFallen} wickets`
        };
      } else {
        match.matchResult = {
          status: "Super Over",
          winningTeam: `${match.superOver.inning2.battingTeam.name}`,
          winningMargin: null
        };
      }
    } else if (currentInning.bowlingTeam.teamId.equals(winningTeamId)) {
      match.matchStatus = "completed";
      if (!match.isSuperOver) {
        match.matchResult = {
          status: "Win",
          winningTeam: `${match.inning2.bowlingTeam.name}`,
          winningMargin: `${
          match.targetScore - match.inning2.totalScore
          } runs`
        };
      } else {
        match.matchResult = {
          status: "Super Over",
          winningTeam: `${match.superOver.inning2.bowlingTeam.name}`,
          winningMargin: null
        };
      }
    }
  }
  if (match.isInningChangePending === true) {
    match.isInningChangePending = false;
  }
  io.to(matchId).emit("scoreUpdated", {
    match
  });
  await match.save();
  res.status(200).json(new ApiResponse(200, match));
});

const getAllMatchDetailsController = asyncHandler(async (req, res) => {
  // const user = req.user;
  const matchDetails = await MatchModel.find();

  if (!matchDetails) {
    throw new ApiError(404, "no match has been found");
  }
  res.status(200).json(new ApiResponse(200, matchDetails));
});

const getSingleMatchDetailsController = asyncHandler(async (req, res) => {
  //const user = req.user;
  const matchId = req.params.matchId;
  const matchDetails = await MatchModel.findOne({
    _id: matchId
  });

  if (!matchDetails) {
    throw new ApiError(404, "no match has been found");
  }
  res.status(200).json(new ApiResponse(200, matchDetails));
});

const getSearchedMatchController = asyncHandler(async (req, res) => {
  const searchQuery = req.query.searched?.trim();

  const user = req.user;
  if (!searchQuery) {
    throw new ApiError(400, "search query is required");
  }

  const query = {
    $or: [{
      "teamA.name": {
        $regex: searchQuery,
        $options: "i"
      }
    },
      {
        "teamB.name": {
          $regex: searchQuery,
          $options: "i"
        }
      },
      {
        "matchPlace.city": {
          $regex: searchQuery,
          $options: "i"
        }
      },
      {
        "matchPlace.ground": {
          $regex: searchQuery,
          $options: "i"
        }
      }],
    createdBy: user._id
  };

  const matches = await MatchModel.find(query);

  if (matches.length === 0) {
    throw new ApiError(404, "no match has been found");
  }

  res.status(200).json(new ApiResponse(200, matches));
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
};