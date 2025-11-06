import mongoose from "mongoose";

// Player Schema (per-match stats)
const PlayerSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player"
    },
    name: String,
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
    outMethod: { type: String, default: null },
    caughtBy: { type: String, default: null },
    dismissBy: { type: String, default: null },

    ballsBowled: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },

    onStrike: { type: Boolean, default: false }
});

// Team Schema
const TeamSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    },
    name: String,
    playing11: [PlayerSchema],
    substitutes: [PlayerSchema],
    captain: {
        name: String,
        captainId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" }
    }
});

// Inning Schema
const InningSchema = new mongoose.Schema({
    battingTeam: TeamSchema,
    bowlingTeam: TeamSchema,

    currentBatsmen: { type: [PlayerSchema], default: [] },
    currentBowler: { type: PlayerSchema, default: null },

    currentOverBalls: { type: Number, default: 0 },
    currentOvers: { type: Number, default: 0 },
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
            currentBowlerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Player"
            },
            strikeBatsmanId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Player"
            },
            nonStrikeBatsmanId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Player"
            }
        }
    ],

    totalScore: { type: Number, default: 0 },
    wicketsFallen: { type: Number, default: 0 },
    totalOvers: { type: Number }
});

// Match Schema
const MatchSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Tournament"
    },
    tournamentName: {
        type: String,
        ref:"Tournament"
    },
    inning1: InningSchema,
    inning2: InningSchema,

    currentInning: { type: Number, default: 1 },
    targetScore: { type: Number, default: null },

    matchStatus: { type: String, default: "no toss" },

    toss: {
        tossWinner: { type: String, default: null },
        tossDecision: {
            type: String,
            enum: ["bat", "ball", null],
            default: null
        }
    },

    teamA: TeamSchema,
    teamB: TeamSchema,

    matchPlace: {
        city: String,
        ground: String
    },

    matchStage: { type: String },
    startTime: { type: Date },

    matchResult: {
        status: {
            type: String,
            enum: [
                "Win",
                "Tie",
                "Super Over",
                "Super Over Tie",
                "abandoned",
                null
            ],
            default: null
        },
        winningTeam: { type: String, default: null },
        winningMargin: { type: String, default: null }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserSignup" },

    // flags
    isSelectNewBatsmanPending: { type: Boolean, default: false },
    isOverChangePending: { type: Boolean, default: false },
    isInningChangePending: { type: Boolean, default: false },
    isSecondInningStarted: { type: Boolean, default: false },
    isSuperOver: { type: Boolean, default: false },
    isSuperOverInProgress: { type: Boolean, default: false },

    superOver: {
        inning1: InningSchema,
        inning2: InningSchema,
        currentInning: { type: Number },
        targetScore: { type: Number }
    }
});

// Match Model
export const MatchModel = mongoose.model("Match", MatchSchema);
