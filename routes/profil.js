const express = require("express");
const router = express.Router();
const db = require("../database");

// avatar1.png ... avatar14.png
const avatars = Array.from({ length: 14 }, (_, i) => `/images/avatars/avatar${i + 1}.png`);

// Page route: not logged in -> go to the login page
function requireLoginPage(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

// API route: not logged in -> JSON error
function requireLoginApi(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ erreur: "You must be logged in." });
    }
    next();
}

// Display the profile page
router.get("/dashboard/profil", requireLoginPage, (req, res) => {
    res.render("profil", {
        nickname: req.session.nickname,
        avatar: req.session.avatar,
        avatars
    });
});

router.get("/profil", (req, res) => {
    res.redirect("/dashboard/profil");
});

/**
 * @openapi
 * /api/profil:
 *   post:
 *     summary: "Update the player's nickname and avatar"
 *     description: |
 *       Updates the nickname and avatar of the logged-in player, then updates the session. The nickname must be unused by other players.
 *
 *       **Body parameters (JSON):**
 *       - `nickname` (string) : new nickname, 1 to 30 characters (spaces around are trimmed)
 *       - `avatar` (string) : path of the chosen avatar, from `/images/avatars/avatar1.png` to `/images/avatars/avatar14.png`
 *     tags: ["Utilisateur"]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nickname, avatar]
 *             properties:
 *               nickname: { type: string, minLength: 1, maxLength: 30, description: "New nickname", example: "Player1" }
 *               avatar: { type: string, description: "Path of the chosen avatar", example: "/images/avatars/avatar3.png" }
 *     responses:
 *       200:
 *         description: "OK, profile updated"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Profile updated" }
 *                 nickname: { type: string, description: "Saved nickname", example: "Player1" }
 *                 avatar: { type: string, description: "Saved avatar", example: "/images/avatars/avatar3.png" }
 *       400:
 *         description: "Invalid nickname or avatar"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, enum: ["The nickname must be between 1 and 30 characters.", "Invalid avatar."], example: "Invalid avatar." }
 *       401:
 *         description: "Player not logged in"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "You must be logged in." }
 *       409:
 *         description: "Nickname already taken"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "This nickname is already taken." }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, enum: ["Error while checking the nickname.", "Error while saving the profile."], example: "Error while saving the profile." }
 */
router.post("/api/profil", requireLoginApi, (req, res) => {
    const nickname = typeof req.body?.nickname === "string" ? req.body.nickname.trim() : "";
    const avatar = req.body?.avatar;

    if (nickname.length < 1 || nickname.length > 30) {
        return res.status(400).json({
            erreur: "The nickname must be between 1 and 30 characters."
        });
    }

    if (!avatars.includes(avatar)) {
        return res.status(400).json({
            erreur: "Invalid avatar."
        });
    }

    // Check that the nickname is not already used by someone else
    db.query(
        "SELECT id FROM users WHERE nickname = ? AND id != ?",
        [nickname, req.session.userId],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    erreur: "Error while checking the nickname."
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    erreur: "This nickname is already taken."
                });
            }

            // Save the changes in MySQL
            db.query(
                "UPDATE users SET nickname = ?, avatar = ? WHERE id = ?",
                [nickname, avatar, req.session.userId],
                (error) => {
                    if (error) {
                        // Someone took the nickname between the check and the update
                        if (error.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                erreur: "This nickname is already taken."
                            });
                        }

                        console.error(error);
                        return res.status(500).json({
                            erreur: "Error while saving the profile."
                        });
                    }

                    // Refresh the session
                    req.session.nickname = nickname;
                    req.session.avatar = avatar;

                    res.json({
                        message: "Profile updated",
                        nickname,
                        avatar
                    });
                }
            );
        }
    );
});

module.exports = router;