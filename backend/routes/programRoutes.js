
const express = require("express");
const mongoose = require("mongoose");
const Program = require("../models/Program");
const ProgramVersion = require("../models/ProgramVersion");
const auth = require("../middleware/auth");

const router = express.Router();

const MAX_VERSIONS = 50;

// Save a snapshot of the current program before changing it.
async function saveVersion(program) {
    await ProgramVersion.create({
        program: program._id,
        user: program.user,
        title: program.title,
        topic: program.topic,
        language: program.language,
        code: program.code,
        savedAt: new Date()
    });

    // Keep only the newest 50 versions for this program.
    const oldVersions = await ProgramVersion.find({
        program: program._id,
        user: program.user
    })
        .sort({ savedAt: -1, _id: -1 })
        .skip(MAX_VERSIONS)
        .select("_id");

    if (oldVersions.length > 0) {
        await ProgramVersion.deleteMany({
            _id: { $in: oldVersions.map(version => version._id) },
            user: program.user
        });
    }
}

// CREATE PROGRAM
router.post("/", auth, async (req, res) => {
    try {
        const { title, topic, language, code } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof topic !== "string" ||
            typeof language !== "string" ||
            typeof code !== "string" || !code.trim()
        ) {
            return res.status(400).json({
                message: "Title, topic, language, and code are required."
            });
        }

        const program = await Program.create({
            title: title.trim(),
            topic,
            language,
            code,
            user: req.user.id
        });

        return res.status(201).json({
            message: "Program saved successfully",
            program
        });
    } catch (error) {
        console.error("Create program error:", error);

        return res.status(500).json({
            message: "Could not create program."
        });
    }
});

// GET THE LOGGED-IN USER'S PROGRAMS
router.get("/", auth, async (req, res) => {
    try {
        const programs = await Program.find({
            user: req.user.id
        }).sort({ updatedAt: -1 });

        return res.json(programs);
    } catch (error) {
        console.error("Get programs error:", error);

        return res.status(500).json({
            message: "Could not load programs."
        });
    }
});

// GET ONE PROGRAM — OWNER ONLY
router.get("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid program ID."
            });
        }

        const program = await Program.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!program) {
            return res.status(404).json({
                message: "Program not found."
            });
        }

        return res.json(program);
    } catch (error) {
        console.error("Get program error:", error);

        return res.status(500).json({
            message: "Could not load program."
        });
    }
});

// UPDATE PROGRAM — SAVE PREVIOUS VERSION FIRST
router.put("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid program ID."
            });
        }

        const { title, topic, language, code } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof topic !== "string" ||
            typeof language !== "string" ||
            typeof code !== "string" || !code.trim()
        ) {
            return res.status(400).json({
                message: "Title, topic, language, and code are required."
            });
        }

        const program = await Program.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!program) {
            return res.status(404).json({
                message: "Program not found."
            });
        }

        const changed =
            program.title !== title.trim() ||
            program.topic !== topic ||
            program.language !== language ||
            program.code !== code;

        // Do not create duplicate history entries for identical content.
        if (changed) {
            await saveVersion(program);
        }

        program.title = title.trim();
        program.topic = topic;
        program.language = language;
        program.code = code;

        await program.save();

        return res.json({
            message: "Program updated successfully",
            program
        });
    } catch (error) {
        console.error("Update program error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Could not update program."
        });
    }
});

// GET VERSION HISTORY — OWNER ONLY
router.get("/:id/versions", auth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid program ID."
            });
        }

        const program = await Program.findOne({
            _id: id,
            user: req.user.id
        });

        if (!program) {
            return res.status(404).json({
                message: "Program not found."
            });
        }

        const versions = await ProgramVersion.find({
            program: program._id,
            user: req.user.id
        })
            .sort({ savedAt: -1, _id: -1 })
            .limit(MAX_VERSIONS)
            .select("-__v");

        return res.json(versions);
    } catch (error) {
        console.error("Get version history error:", error);

        return res.status(500).json({
            message: "Could not load version history."
        });
    }
});

// RESTORE AN OLDER VERSION — OWNER ONLY
router.post("/:id/versions/:versionId/restore", auth, async (req, res) => {
    try {
        const { id, versionId } = req.params;

        if (
            !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(versionId)
        ) {
            return res.status(400).json({
                message: "Invalid program or version ID."
            });
        }

        const program = await Program.findOne({
            _id: id,
            user: req.user.id
        });

        if (!program) {
            return res.status(404).json({
                message: "Program not found."
            });
        }

        const version = await ProgramVersion.findOne({
            _id: versionId,
            program: program._id,
            user: req.user.id
        });

        if (!version) {
            return res.status(404).json({
                message: "Version not found."
            });
        }

        // Preserve the current content before restoring the older version.
        const currentContentDiffers =
            program.title !== version.title ||
            program.topic !== version.topic ||
            program.language !== version.language ||
            program.code !== version.code;

        if (currentContentDiffers) {
            await saveVersion(program);
        }

        program.title = version.title;
        program.topic = version.topic;
        program.language = version.language;
        program.code = version.code;

        await program.save();

        return res.json({
            message: "Previous version restored successfully.",
            program
        });
    } catch (error) {
        console.error("Restore version error:", error);

        return res.status(500).json({
            message: "Could not restore version."
        });
    }
});

// DELETE PROGRAM — OWNER ONLY
router.delete("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid program ID."
            });
        }

        const program = await Program.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!program) {
            return res.status(404).json({
                message: "Program not found."
            });
        }

        // Remove history when the program itself is deleted.
        await ProgramVersion.deleteMany({
            program: program._id,
            user: req.user.id
        });

        return res.json({
            message: "Program deleted successfully."
        });
    } catch (error) {
        console.error("Delete program error:", error);

        return res.status(500).json({
            message: "Could not delete program."
        });
    }
});

module.exports = router;

