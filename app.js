const express = require("express");
const expressSession = require("express-session");

const app = express();

const PORT = 3000;

const db = require("./database");

// Pug
app.set("view engine", "pug");
app.set("views", "./views");

// Fichiers CSS, JS, images...
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    expressSession({
        secret: "userInfo",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true
        }
    })
);

app.use((req, res, next) => {
    if (req.session.userId) {
        res.locals.user = {
            id: req.session.userId,
            nickname: req.session.nickname
        };
    } else {
        res.locals.user = null;
    }
    next();
});

// Page d'accueil
app.get("/", (req, res) => {
    res.render("pre_index");
});

app.get("/index", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.render("index");
});

// learn page
app.get("/learn", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.render("learn");
});

// Login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Game page
app.get("/jeu", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.render("jeu");
});

app.use("/", require("./routes/login"));

// Result page
app.get("/result", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    db.query(
        `SELECT nickname, best_score, best_hard_score
         FROM users`,
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Database error");
            }

            const classement = [...results].sort((a, b) => b.best_score - a.best_score);

            const classementHard = [...results].sort(
                (a, b) => b.best_hard_score - a.best_hard_score
            );

            res.render("result", {
                scoreboard: classement,
                scoreboard2: classementHard,
                nickname: req.session.nickname
            });
        }
    );
});

app.get("/api/produits", (req, res) => {
    db.query("SELECT id, nom, nom_restaurant, image, description FROM produit", (err, results) => {
        if (err) {
            console.error("Erreur BDD :", err);
            return res.status(500).json({ erreur: "Erreur BDD" });
        }

        res.json(results);
    });
});

app.post("/api/hint", (req, res) => {
    const { partieId, id, reponse } = req.body;

    // Récupère le prix du produit
    db.query("SELECT prix FROM produit WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                erreur: "Erreur BDD"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                erreur: "Produit introuvable"
            });
        }

        const prix = Number(results[0].prix);
        const reponse_joueur = Number(reponse);

        let message;

        if (reponse_joueur < prix) {
            message = "more than " + reponse_joueur;
        } else if (reponse_joueur > prix) {
            message = "less than " + reponse_joueur;
        } else {
            message = "that's it ! " + reponse_joueur;
        }

        // Retire un indice dans la BDD
        db.query(
            `UPDATE partie
                 SET hint_count = hint_count - 1
                 WHERE id = ? AND hint_count > 0`,
            [partieId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        erreur: "Erreur BDD"
                    });
                }

                // Aucun indice disponible
                if (result.affectedRows === 0) {
                    return res.status(400).json({
                        erreur: "Plus d'indices More or Less"
                    });
                }

                // Récupère le nombre d'indices restant
                db.query(
                    "SELECT hint_count FROM partie WHERE id = ?",
                    [partieId],
                    (err, results) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                erreur: "Erreur BDD"
                            });
                        }

                        res.json({
                            message: message,
                            hint_count: results[0].hint_count
                        });
                    }
                );
            }
        );
    });
});

app.post("/api/temperature", (req, res) => {
    const { partieId, id, reponse } = req.body;

    // Récupère le prix
    db.query("SELECT prix FROM produit WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                erreur: "Erreur BDD"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                erreur: "Produit introuvable"
            });
        }

        const prix = Number(results[0].prix);
        const reponse_joueur = Number(reponse);
        const difference = Math.abs(reponse_joueur - prix);

        let message;
        let couleur;

        if (difference < 1) {
            message = "very hot at " + reponse_joueur;
            couleur = "red";
        } else if (difference < 4) {
            message = "hot at " + reponse_joueur;
            couleur = "orange";
        } else if (difference < 8) {
            message = "cold at " + reponse_joueur;
            couleur = "blue";
        } else {
            message = "very cold at " + reponse_joueur;
            couleur = "darkblue";
        }

        // Retire un indice dans la BDD
        db.query(
            `UPDATE partie
                 SET temp_count = temp_count - 1
                 WHERE id = ? AND temp_count > 0`,
            [partieId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        erreur: "Erreur BDD"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(400).json({
                        erreur: "Plus d'indices Temperature"
                    });
                }

                // Récupère le nombre restant
                db.query(
                    "SELECT temp_count FROM partie WHERE id = ?",
                    [partieId],
                    (err, results) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                erreur: "Erreur BDD"
                            });
                        }

                        res.json({
                            message: message,
                            couleur: couleur,
                            temp_count: results[0].temp_count
                        });
                    }
                );
            }
        );
    });
});

app.post("/api/verifier", (req, res) => {
    const { partieId, id, reponse } = req.body;

    // Récupère le prix du produit
    db.query("SELECT prix FROM produit WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                erreur: "Erreur BDD"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                erreur: "Produit introuvable"
            });
        }

        const prix = Number(results[0].prix);
        const reponse_joueur = Number(reponse);

        // Calcul des points de base
        let points = 4 - Math.abs((reponse_joueur - prix) / 2.5);

        points = Math.max(0, points);

        // Calcul de l'écart
        const ecart = Math.abs(Math.round((reponse_joueur - prix) * 100) / 100);

        // Récupère le mode de la partie
        db.query("SELECT hard FROM partie WHERE id = ?", [partieId], (err, parties) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    erreur: "Erreur BDD"
                });
            }

            if (parties.length === 0) {
                return res.status(404).json({
                    erreur: "Partie introuvable"
                });
            }

            // Applique le Hard Mode
            if (Number(parties[0].hard) === 1) {
                points = 4 - Math.abs((reponse_joueur - prix) / 0.5);
                if (points < 0) {
                    points = points / 10;
                    points = Math.max(-5, points);
                }
            }

            // Ajoute les points et passe à la manche suivante
            db.query(
                `UPDATE partie
                         SET score = score + ?,
                             round = round + 1
                         WHERE id = ?`,
                [points, partieId],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            erreur: "Erreur BDD"
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            erreur: "Partie introuvable"
                        });
                    }

                    // Récupère le nouveau score et la nouvelle manche
                    db.query(
                        `SELECT score, round
                                 FROM partie
                                 WHERE id = ?`,
                        [partieId],
                        (err, results) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({
                                    erreur: "Erreur BDD"
                                });
                            }

                            res.json({
                                points: points,
                                prix: prix,
                                ecart: ecart,
                                score: Number(results[0].score),
                                round: results[0].round
                            });
                        }
                    );
                }
            );
        });
    });
});

app.get("/api/partie/:id", (req, res) => {
    const partieId = req.params.id;

    db.query(
        `SELECT score, round, hint_count, temp_count, hard
         FROM partie
         WHERE id = ?`,
        [partieId],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    erreur: "Erreur BDD"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    erreur: "Partie introuvable"
                });
            }

            res.json(results[0]);
        }
    );
});

app.post("/api/new-game", (req, res) => {
    // Récupère le mode choisi : 1 = Hard, 0 = Normal
    const hard = Number(req.body.hard) === 1 ? 1 : 0;

    // Valeurs de départ selon le mode
    const hintCount = hard ? 1 : 2;
    const tempCount = hard ? 1 : 2;

    db.query(
        `INSERT INTO partie
        (score, round, hint_count, temp_count, hard)
        VALUES (0, 1, ?, ?, ?)`,
        [hintCount, tempCount, hard],
        (err, result) => {
            if (err) {
                console.error("Erreur création partie :", err);

                return res.status(500).json({
                    erreur: "Erreur BDD"
                });
            }

            res.json({
                partieId: result.insertId
            });
        }
    );
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/api/learn", (req, res) => {
    const { partieId, id, reponse } = req.body;

    db.query(
        "SELECT nom, nom_restaurant, image, description FROM produit WHERE id = ?",
        [id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    erreur: "Erreur BDD"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    erreur: "Produit introuvable"
                });
            }

            const produit = results[0];

            res.json({
                nom: produit.nom,
                restaurant: produit.nom_restaurant,
                image: produit.image,
                description: produit.description
            });
        }
    );
});

app.post("/api/fin-partie", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.status(401).json({
            message: "You must be logged in"
        });
    }

    const userId = req.session.userId;
    const { score } = req.body;

    // Vérifie que le score est valide
    if (typeof score !== "number" || !Number.isFinite(score)) {
        return res.status(400).json({
            message: "Invalid score"
        });
    }

    // Enregistre uniquement le meilleur score
    db.query(
        `UPDATE users
     SET best_score = CASE
         WHEN best_score IS NULL THEN ?
         ELSE GREATEST(best_score, ?)
     END
     WHERE id = ?`,
        [score, score, userId],
        (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json({ message: "Score saved" });
        }
    );
});

app.post("/api/fin-partie-hard", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.status(401).json({
            message: "You must be logged in"
        });
    }

    const userId = req.session.userId;
    const { score } = req.body;

    // Vérifie que le score est valide
    if (typeof score !== "number" || !Number.isFinite(score)) {
        return res.status(400).json({
            message: "Invalid score"
        });
    }

    // Enregistre uniquement le meilleur score
    db.query(
        `UPDATE users
     SET best_hard_score = CASE
         WHEN best_hard_score IS NULL THEN ?
         ELSE GREATEST(best_hard_score, ?)
     END
     WHERE id = ?`,
        [score, score, userId],
        (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json({ message: "Score saved" });
        }
    );
});

app.get("/hall_of_fame", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    db.query(
        `SELECT nickname, best_score
         FROM users
         WHERE best_score IS NOT NULL
         ORDER BY best_score DESC
         LIMIT 10`,
        (err, scoreboard) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Database error");
            }

            db.query(
                `SELECT nickname, best_hard_score
                 FROM users
                 WHERE best_hard_score IS NOT NULL
                 ORDER BY best_hard_score DESC
                 LIMIT 10`,
                (err2, scoreboard2) => {
                    if (err2) {
                        console.error(err2);
                        return res.status(500).send("Database error");
                    }

                    res.render("hall_of_fame", {
                        nickname: req.session.nickname,
                        scoreboard: scoreboard,
                        scoreboard2: scoreboard2
                    });
                }
            );
        }
    );
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
