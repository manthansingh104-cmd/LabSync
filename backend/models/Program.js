const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        topic: {
            type: String,
            required: true,
            enum: [
                "Array",
                "Stack",
                "Queue",
                "Linked List",
                "Tree",
                "Graph",
                "Searching",
                "Sorting",
                "Other"
            ]
        },

        language: {
            type: String,
            required: true,
            default: "C++"
        },

        code: {
            type: String,
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Program", programSchema);