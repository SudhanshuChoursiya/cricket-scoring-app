import mongoose from "mongoose";

// Player Schema
const PlayerSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: String,
    runs: {
        type: Number
    },
    balls: {
        type: Number
    },
    fours: {
        type: Number
    },
    sixes: {
        type: Number
    },
    isOut: {
        type: Boolean
    },
    outMethod: {
        type: String
    },
    caughtBy: {
        type: String
    },
    dismissBy: {
        type: String
    },
    ballsBowled: {
        type: Number
    },
    wickets: {
        type: Number
    },
    overs: {
        type: Number
    },
    runsConceded: {
        type: Number
    },
    onStrike: {
        type: Boolean
    }
});

// Team Schema
const TeamSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: String,
    playing11: [PlayerSchema],
    substitutes: [PlayerSchema],
    captain: {
        name: String,
        captainId: mongoose.Schema.Types.ObjectId
    }
});

// Inning Schema
const InningSchema = new mongoose.Schema({
    battingTeam: TeamSchema,
    bowlingTeam: TeamSchema,
    currentBatsmen: {
        type: [PlayerSchema],
        default: []
    },
    currentBowler: {
        type: PlayerSchema,
        default: null
    },
    currentOverBalls: {
        type: Number,
        default: 0
    },
    currentOvers: {
        type: Number,
        default: 0
    },
    currentOverTimeline: [
        {
            overNumber: Number,
            ballNumber: Number,
            runs: Number,
            isFour: Boolean,
            isSix: Boolean,
            isWide: Boolean,
            isNoball: Boolean,
            isLegBye: Boolean,
            isBye: Boolean,
            isDeadBall: Boolean,
            isWicket: Boolean,
            outMethod: String,
            currentBowlerId: mongoose.Schema.Types.ObjectId,
            strikeBatsmanId: mongoose.Schema.Types.ObjectId,
            nonStrikeBatsmanId: mongoose.Schema.Types.ObjectId
        }
    ],
    totalScore: {
        type: Number,
        default: 0
    },
    wicketsFallen: {
        type: Number,
        default: 0
    },
    totalOvers: {
        type: Number
    }
});

// Match Schema
const MatchSchema = new mongoose.Schema({
    inning1: InningSchema,
    inning2: InningSchema,
    currentInning: {
        type: Number,
        default: 1
    },
    targetScore: {
        type: Number,
        default: null
    },
    matchStatus: {
        type: String,
        default: "no toss"
    },
    toss: {
        tossWinner: {
            type: String,
            default: null
        },
        tossDecision: {
            type: String,
            enum: ["bat", "ball"],
            default: null
        }
    },
    teamA: TeamSchema,
    teamB: TeamSchema,
    matchPlace: {
        city: {
            type: String
        },
        ground: {
            type: String
        }
    },
    matchResult: {
        type: String,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserSignup"
    },
    isSelectNewBatsmanPending: {
        type: Boolean,
        default: false
    },
    isOverChangePending: {
        type: Boolean,
        default: false
    },
    isInningChangePending: {
        type: Boolean,
        default: false
    },
    isSecondInningStarted: {
        type: Boolean,
        default: false
    },
    isSuperOver: {
        type: Boolean,
        default: false
    },
    superOver: {
        inning1: InningSchema,
        inning2: InningSchema,
        currentInning: {
            type: Number
        },
        targetScore: {
            type: Number
        }
    }
});

// Match Model
export const MatchModel = mongoose.model("Match", MatchSchema);
