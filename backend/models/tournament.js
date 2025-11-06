import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        location: {
            city: {
                type: String,
                required: true
            },
            ground: {
                type: String,
                required: true
            }
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserSignup" }
    },
    { timestamps: true }
);

// Virtual field for status
TournamentSchema.virtual("status").get(function () {
    const now = new Date();
    // Normalize current date to midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Normalize startDate and endDate to midnight
    const start = new Date(
        this.startDate.getFullYear(),
        this.startDate.getMonth(),
        this.startDate.getDate()
    );
    const end = new Date(
        this.endDate.getFullYear(),
        this.endDate.getMonth(),
        this.endDate.getDate()
    );

    if (today < start) return "upcoming";
    if (today > end) return "completed";
    return "ongoing";
});

// Include virtuals in JSON responses
TournamentSchema.set("toJSON", { virtuals: true });
TournamentSchema.set("toObject", { virtuals: true });

export const TournamentModel = mongoose.model("Tournament", TournamentSchema);
