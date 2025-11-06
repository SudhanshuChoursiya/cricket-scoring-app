import mongoose from "mongoose";

// Subdocument for tournament-specific stats
const TournamentStatsSchema = new mongoose.Schema(
    {
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament"
        },
        matches: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        ballsFaced: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        ballsBowled: { type: Number, default: 0 },
        runsConceded: { type: Number, default: 0 },
        dismissals: { type: Number, default: 0 } // for batting average
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
            runs: { type: Number, default: 0 },
            ballsFaced: { type: Number, default: 0 },
            fours: { type: Number, default: 0 },
            sixes: { type: Number, default: 0 },
            wickets: { type: Number, default: 0 },
            ballsBowled: { type: Number, default: 0 },
            runsConceded: { type: Number, default: 0 },
            dismissals: { type: Number, default: 0 }
        },

        // Tournament-wise Stats
        tournamentStats: [TournamentStatsSchema],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserSignup"
        }
    },
    { timestamps: true }
);

export const PlayerModel = mongoose.model("Player", PlayerSchema);
