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
    "/images/avatars/avatar7.png"
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
