import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    team_name: {
        type: String,
        required: true
    },
    players: {
        type: [
            {
                playerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: () => new mongoose.Types.ObjectId()
                },
                name: {
                    type: String,
                    required: true
                }
            }
        ],
        default: []
    },
    city: {
        type: String,
        required: true
    },
    captain_name: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserSignup"
    }
});

export const TeamModel = mongoose.model("Team", teamSchema);
