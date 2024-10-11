import mongoose from "mongoose";

// Player Schema
const PlayerSchema = new mongoose.Schema({
    name: String,
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
    outMethod: { type: String, default: "" },
    caughtBy: { type: String, default: "" },
    ballsBowled: {
        type: Number,
        default: 0
    },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 }
});

// Team Schema
const TeamSchema = new mongoose.Schema({
    name: String,
    players: [PlayerSchema]
});

// Inning Schema
const InningSchema = new mongoose.Schema({
    battingTeam: TeamSchema,
    bowlingTeam: TeamSchema,
    currentBatsmen: [PlayerSchema], // Two active batsmen
    currentBowler: PlayerSchema,
    currentOverBalls: { type: Number, default: 0 },
    currentOvers: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    wicketsFallen: { type: Number, default: 0 },
    isInningComplete: { type: Boolean, default: false },
    totalOvers: {
        type: Number
    }
});

// Match Schema
const MatchSchema = new mongoose.Schema({
    inning1: InningSchema,
    inning2: InningSchema,
    currentInning: { type: Number, default: 1 }, // 1 for the first inning, 2 for the second
    targetScore: { type: Number, default: 0 }, // Set after the first inning,
    status: {
        type: String,
        default: "in progress"
    }
});

// Match Model
export const MatchModel = mongoose.model("MatchModel", MatchSchema);
