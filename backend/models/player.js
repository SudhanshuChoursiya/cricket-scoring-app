import mongoose from "mongoose";

// Subdocument for tournament-specific stats
const TournamentStatsSchema = new mongoose.Schema(
    {
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament"
        },
        matches: { type: Number, default: 0 },
        inningsBatted: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        ballsFaced: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        highestRuns: { type: Number, default: 0 },
        battingAverage: { type: Number, default: null },
        strikeRate: { type: Number, default: null },
        fifties: { type: Number, default: 0 },
        hundreds: { type: Number, default: 0 },
        dismissals: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        ballsBowled: { type: Number, default: 0 },
        runsConceded: { type: Number, default: 0 },
        inningsBowled: { type: Number, default: 0 },
        bestBowlingWickets: { type: Number, default: 0 },
        bestBowlingRuns: { type: Number, default: 0 },
        threeWicketHauls: { type: Number, default: 0 },
        fiveWicketHauls: { type: Number, default: 0 },
        economy: { type: Number, default: null },
        bowlingAverage: { type: Number, default: null }
    },
    { _id: false }
);

const PlayerSchema = new mongoose.Schema(
    {
        playerId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        // Career Stats (overall stats across all matches)
        careerStats: {
            matches: { type: Number, default: 0 },
            inningsBatted: { type: Number, default: 0 },
            runs: { type: Number, default: 0 },
            ballsFaced: { type: Number, default: 0 },
            fours: { type: Number, default: 0 },
            sixes: { type: Number, default: 0 },
            highestRuns: { type: Number, default: 0 },
            battingAverage: { type: Number, default: null },
            strikeRate: { type: Number, default: null },
            fifties: { type: Number, default: 0 },
            hundreds: { type: Number, default: 0 },
            dismissals: { type: Number, default: 0 },
            wickets: { type: Number, default: 0 },
            ballsBowled: { type: Number, default: 0 },
            runsConceded: { type: Number, default: 0 },
            inningsBowled: { type: Number, default: 0 },
            bestBowlingWickets: { type: Number, default: 0 },
            bestBowlingRuns: { type: Number, default: 0 },
            threeWicketHauls: { type: Number, default: 0 },
            fiveWicketHauls: { type: Number, default: 0 },
            economy: { type: Number, default: null },
            bowlingAverage: { type: Number, default: null }
        },

        // Tournament-wise Stats
        tournamentStats: [TournamentStatsSchema],

        // Processed matches for duplicate-stat prevention
        processedMatchIds: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Match"
                }
            ],
            default: []
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserSignup"
        }
    },
    { timestamps: true }
);

export const PlayerModel = mongoose.model("Player", PlayerSchema);
