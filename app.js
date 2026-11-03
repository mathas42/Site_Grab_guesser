const express = require("express");
const expressSession = require("express-session");

//swagger ui
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

const PORT = 3000;

const db = require("./database");

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

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
            nickname: req.session.nickname,
            avatar: req.session.avatar
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
app.use("/", require("./routes/profil"));

// Result page
app.get("/result", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    db.query(
        `SELECT nickname, avatar, best_score, best_hard_score
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
                nickname: req.session.nickname,
                avatar: req.session.avatar
            });
        }
    );
});

/**
 * @openapi
 * /api/produits:
 *   get:
 *     summary: "Gets all product informations"
 *     description: "Gives all essential informations about every product : id, dish name, restaurant name, an image and a description"
 *     tags: ["Produit"]
 *     responses:
 *       200:
 *         description: "OK"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, description: "Product ID", example: 0 }
 *                   nom: { type: string, description: "Dish name", example: "" }
 *                   nom_restaurant: { type: string, description: "Name of the restaurant", example: "Shawarma Al Sham - Bandar Tasik Selatan" }
 *                   image: { type: string, description: "Dish image", example: "/images/Shawarma_beef.jpg" }
 *                   description: { type: string, description: "Description of the dish", example: "Shawarma is a popular Middle Eastern dish, particularly associated with Levantine cuisine." }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Erreur BDD" }
 */
app.get("/api/produits", (req, res) => {
    db.query("SELECT id, nom, nom_restaurant, image, description FROM produit", (err, results) => {
        if (err) {
            console.error("Erreur BDD :", err);
            return res.status(500).json({ erreur: "Erreur BDD" });
        }

        res.json(results);
    });
});

/**
 * @openapi
 * /api/hint:
 *   post:
 *     summary: "Uses a hint"
 *     description: |
 *       Tells the player whether the real price is higher or lower than their current guess, and removes one hint from the game.
 *
 *       **Body parameters (JSON):**
 *       - `partieId` (integer) : id of the game
 *       - `id` (integer) : product's id
 *       - `reponse` (number) : price guessed by the player
 *     tags: ["Partie"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [partieId, id, reponse]
 *             properties:
 *               partieId: { type: integer, description: "Id of ongoing game", example: 1 }
 *               id: { type: integer, description: "Product's id", example: 3 }
 *               reponse: { type: number, description: "Price currently guessed by the player", example: 15 }
 *     responses:
 *       200:
 *         description: "OK"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, description: "\"more than X\", \"less than X\" or \"that's it ! X\", X being the player's guess", example: "more than 15" }
 *                 hint_count: { type: integer, description: "Remaining \"More or Less\" hints", example: 1 }
 *       400:
 *         description: "No hint left, or game unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Plus d'indices More or Less" }
 *       404:
 *         description: "Product unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Produit introuvable" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Erreur BDD" }
 */
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

/**
 * @openapi
 * /api/temperature:
 *   post:
 *     summary: "Use a hint"
 *     description: |
 *       Tells the player how close their current guess is to the real price, and removes one "Temperature" hint from the game.
 *
 *       | Gap with real price | Message | Color |
 *       |---|---|---|
 *       | < 1 | very hot | red |
 *       | < 4 | hot | orange |
 *       | < 8 | cold | blue |
 *       | >= 8 | very cold | darkblue |
 *
 *       **Body parameters (JSON):**
 *       - `partieId` (integer) : id of ongoing game
 *       - `id` (integer) : product's id
 *       - `reponse` (number) : price currently guessed by the player
 *     tags: ["Partie"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [partieId, id, reponse]
 *             properties:
 *               partieId: { type: integer, description: "Id of game", example: 1 }
 *               id: { type: integer, description: "Product's id", example: 3 }
 *               reponse: { type: number, description: "Price currently guessed by the player", example: 15 }
 *     responses:
 *       200:
 *         description: "OK"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, description: "\"very hot at X\", \"hot at X\", \"cold at X\" or \"very cold at X\", X being the player's guess", example: "hot at 15" }
 *                 couleur: { type: string, enum: [red, orange, blue, darkblue], description: "Color matching the temperature", example: "orange" }
 *                 temp_count: { type: integer, description: "Remaining \"Temperature\" hints", example: 1 }
 *       400:
 *         description: "No hint left, or game unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Plus d'indices Temperature" }
 *       404:
 *         description: "Product unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Produit introuvable" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Erreur BDD" }
 */
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



/**
 * @openapi
 * /api/verifier:
 *   post:
 *     summary: "Check player's response and calculates points"
 *     description: |
 *       Compares the user's price selection and compares it to the real price. It then calculates the points given to the player and goes to the next round.
 *
 *       **Body parameters (JSON):**
 *       - `partieId` (integer) : id of ongoing game
 *       - `id` (integer) : product's id
 *       - `reponse` (number) : price guessed by the player
 *     tags: ["Partie"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [partieId, id, reponse]
 *             properties:
 *               partieId:
 *                 oneOf:
 *                   - { type: integer }
 *                   - { type: string }
 *                 description: "Id of ongoing game (the front sends it as a string read from localStorage)"
 *                 example: 1
 *               id: { type: integer, description: "Product's id", example: 3 }
 *               reponse: { type: number, description: "Answer given by player", example: 5.5 }
 *     responses:
 *       200:
 *         description: "OK, score updated and next round can start"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points: { type: number, description: "Points earned", example: 3.2 }
 *                 prix: { type: number, description: "True price", example: 6 }
 *                 ecart: { type: number, description: "Difference between guess and true price", example: 0.5 }
 *                 score: { type: number, description: "New total score", example: 10.4 }
 *                 round: { type: integer, description: "New round", example: 4 }
 *       404:
 *         description: "Product or game unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, enum: ["Produit introuvable", "Partie introuvable"], example: "Produit introuvable" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Erreur BDD" }
 */
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
/**
 * @openapi
 * /api/partie/{id}:
 *   get:
 *     summary: "Select a game from its ID"
 *     description: |
 *       Returns the current state of a game: score, round, remaining hints and difficulty mode.
 *
 *       **Path parameters:**
 *       - `id` (integer) : Game ID to search
 *     tags: ["Partie"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: "Game ID to search"
 *         example: 1
 *     responses:
 *       200:
 *         description: "OK, game found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score: { type: number, description: "Current total score", example: 10.4 }
 *                 round: { type: integer, description: "Current round", example: 4 }
 *                 hint_count: { type: integer, description: "Remaining hints", example: 2 }
 *                 temp_count: { type: integer, description: "Remaining temperature hints", example: 1 }
 *                 hard: { type: integer, description: "1 = hard mode, 0 = normal mode", example: 0 }
 *       404:
 *         description: "Unfindable game"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Partie introuvable" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Erreur BDD" }
 */
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

/**
 * @openapi
 * /api/new-game:
 *   post:
 *     summary: "Creates a new game"
 *     description: |
 *       Creates a new game starting at round 1 with a score of 0, and returns its id. The game gets 2 "More or Less" and 2 "Temperature" hints in normal mode, and only 1 of each in hard mode.
 *
 *       **Body parameters (JSON):**
 *       - `hard` (integer, optional) : Gamemode selected, 0 for normal, 1 for hard.
 *     tags: ["Partie"]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hard: { type: integer, enum: [0, 1], default: 0, description: "Gamemode selected, 0 for normal, 1 for hard.", example: 0 }
 *     responses:
 *       200:
 *         description: "OK"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 partieId: { type: integer, description: "game ID", example: 0 }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Erreur BDD" }
 */
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
    res.render("register", { avatars });
});

/**
 * @openapi
 * /api/learn:
 *   post:
 *     summary: "Get a product's details"
 *     description: |
 *       Returns the name, restaurant, image and description of a product.
 *
 *       **Body parameters (JSON):**
 *       - `id` (integer) : product's id
 *     tags: ["Produit"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: integer, description: "Product's id", example: 1 }
 *     responses:
 *       200:
 *         description: "OK"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nom: { type: string, description: "Product's name", example: "Shawarma Beef Medium" }
 *                 restaurant: { type: string, description: "Restaurant selling the product", example: "Shawarma Al Sham - Bandar Tasik Selatan" }
 *                 image: { type: string, description: "Path to the product's image", example: "/images/Shawarma_beef.jpg" }
 *                 description: { type: string, nullable: true, description: "Description of the product", example: "Shawarma is a popular Middle Eastern dish, particularly associated with Levantine cuisine." }
 *       404:
 *         description: "Product unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Produit introuvable" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Erreur BDD" }
 */
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

/**
 * @openapi
 * /api/fin-partie:
 *   post:
 *     summary: "Save the score of a normal (ie not hard) game"
 *     description: |
 *       Saves the final score of a normal mode game as the player's best_score if it beats the current one.
 *
 *       **Body parameters (JSON):**
 *       - `score` (number) : final score of the game
 *     tags: ["Partie"]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [score]
 *             properties:
 *               score: { type: number, description: "Final score of the game", example: 18.5 }
 *     responses:
 *       200:
 *         description: "OK, score saved and best score only updated if beaten"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Score saved" }
 *       400:
 *         description: "Score missing or not a number"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid score" }
 *       401:
 *         description: "Player not logged in"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "You must be logged in" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Database error" }
 */
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

/**
 * @openapi
 * /api/fin-partie-hard:
 *   post:
 *     summary: "Save the score of a hard game"
 *     description: |
 *       Saves the final score of a hard mode game as the player's best_hard_score, only if it beats the previous one.
 *
 *       **Body parameters (JSON):**
 *       - `score` (number) : final score of the game
 *     tags: ["Partie"]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [score]
 *             properties:
 *               score: { type: number, description: "Final score of the game (can be negative)", example: 12.3 }
 *     responses:
 *       200:
 *         description: "OK, score saved, best hard score only updated if beaten"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Score saved" }
 *       400:
 *         description: "Score missing or not a number"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid score" }
 *       401:
 *         description: "Player not logged in"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "You must be logged in" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Database error" }
 */
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

/**
 * @openapi
 * /api/avatar:
 *   post:
 *     summary: "Change the player's avatar"
 *     description: |
 *       Saves the chosen avatar for the player and updates it.
 *
 *       **Body parameters (JSON):**
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
 *             required: [avatar]
 *             properties:
 *               avatar: { type: string, description: "Path of the chosen avatar", example: "/images/avatars/avatar3.png" }
 *     responses:
 *       200:
 *         description: "OK"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Avatar enregistré !" }
 *       400:
 *         description: "Avatar not in the allowed list"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Avatar invalide." }
 *       401:
 *         description: "Player not logged in"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Vous devez être connecté." }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur: { type: string, example: "Erreur de sauvegarde." }
 */
app.post("/api/avatar", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    const { avatar } = req.body;

    // Autoriser uniquement les avatars disponibles
    if (!avatars.includes(avatar)) {
        return res.status(400).json({
            erreur: "Avatar invalide."
        });
    }

    db.query("UPDATE users SET avatar = ? WHERE id = ?", [avatar, req.session.userId], (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erreur: "Erreur de sauvegarde."
            });
        }

        req.session.avatar = avatar;

        res.json({
            message: "Avatar enregistré !"
        });
    });
});

app.get("/hall_of_fame", (req, res) => {
    // Vérifie que le joueur est connecté
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    db.query(
        `SELECT nickname,avatar , best_score
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
                `SELECT nickname,avatar , best_hard_score
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
                        avatar: req.session.avatar,
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
