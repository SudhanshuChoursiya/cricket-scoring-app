import mongoose from "mongoose";

// Player Schema
const PlayerSchema = new mongoose.Schema({
    name: String,
    runs: {
        type: Number,
        default: 0
    },
    balls: {
        type: Number,
        default: 0
    },
    fours: {
        type: Number,
        default: 0
    },
    sixes: {
        type: Number,
        default: 0
    },
    isOut: {
        type: Boolean,
        default: false
    },
    outMethod: {
        type: String,
        default: ""
    },
    caughtBy: {
        type: String,
        default: ""
    },
    ballsBowled: {
        type: Number,
        default: 0
    },
    wickets: {
        type: Number,
        default: 0
    },
    overs: {
        type: Number,
        default: 0
    },
    runsConceded: {
        type: Number,
        default: 0
    },
    onStrike: {
        type: Boolean
    }
});

// Team Schema
const TeamSchema = new mongoose.Schema({
    name: String,
    playing11: [PlayerSchema]
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
    totalScore: {
        type: Number,
        default: 0
    },
    wicketsFallen: {
        type: Number,
        default: 0
    },
    isInningComplete: {
        type: Boolean,
        default: false
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
        default: 0
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserSignup"
    }
});

// Match Model
export const MatchModel = mongoose.model("Match", MatchSchema);
