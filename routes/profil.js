const express = require("express");
const router = express.Router();
const db = require("../database");

const avatars = [
    "/images/avatars/avatar1.png",
    "/images/avatars/avatar2.png",
    "/images/avatars/avatar3.png",
    "/images/avatars/avatar4.png",
    "/images/avatars/avatar5.png",
    "/images/avatars/avatar6.png",
    "/images/avatars/avatar7.png",
    "/images/avatars/avatar8.png",
    "/images/avatars/avatar9.png",
    "/images/avatars/avatar10.png",
    "/images/avatars/avatar11.png",
    "/images/avatars/avatar12.png",
    "/images/avatars/avatar13.png",
    "/images/avatars/avatar14.png"
];

// Afficher la page du profil
router.get("/profil", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.render("profil", {
        nickname: req.session.nickname,
        avatar: req.session.avatar,
        avatars
    });
});

// Modifier le pseudo et l'avatar
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
 *                 message: { type: string, example: "Profil updated" }
 *                 nickname: { type: string, description: "Saved nickname", example: "Player1" }
 *                 avatar: { type: string, description: "Saved avatar", example: "/images/avatars/avatar3.png" }
 *       400:
 *         description: "Invalid nickname or avatar"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, enum: ["Le pseudo doit contenir entre 1 et 30 caractères.", "Avatar invalide."], example: "Avatar invalide." }
 *       401:
 *         description: "Player not logged in"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Vous devez être connecté." }
 *       409:
 *         description: "Nickname already taken"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Ce pseudo est déjà utilisé." }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, enum: ["Erreur lors de la vérification du pseudo.", "Erreur lors de la sauvegarde du profil."], example: "Erreur lors de la sauvegarde du profil." }
 */
router.post("/api/profil", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    const nickname = req.body.nickname?.trim();
    const avatar = req.body.avatar;

    if (!nickname || nickname.length > 30) {
        return res.status(400).json({
            erreur: "Le pseudo doit contenir entre 1 et 30 caractères."
        });
    }

    if (!avatars.includes(avatar)) {
        return res.status(400).json({
            erreur: "Avatar invalide."
        });
    }

    // Vérifier que le pseudo n'est pas déjà utilisé
    db.query(
        "SELECT id FROM users WHERE nickname = ? AND id != ?",
        [nickname, req.session.userId],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    erreur: "Erreur lors de la vérification du pseudo."
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    erreur: "Ce pseudo est déjà utilisé."
                });
            }

            // Enregistrer les changements dans MySQL
            db.query(
                "UPDATE users SET nickname = ?, avatar = ? WHERE id = ?",
                [nickname, avatar, req.session.userId],
                (error) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).json({
                            erreur: "Erreur lors de la sauvegarde du profil."
                        });
                    }

                    // Mettre à jour la session
                    req.session.nickname = nickname;
                    req.session.avatar = avatar;

                    res.json({
                        message: "Profil updated",
                        nickname,
                        avatar
                    });
                }
            );
        }
    );
});

module.exports = router;
