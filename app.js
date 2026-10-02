const express = require("express");

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


// Page d'accueil
app.get("/", (req, res) => {
    res.render("index");
});


// Page du jeu
app.get("/jeu", (req, res) => {
    res.render("jeu");
});


// Page résultat
app.get("/resultat", (req, res) => {
    res.render("resultat");
});

app.get("/api/produits", (req, res) => {
    db.query(
        "SELECT id, nom, nom_restaurant, image FROM produit",
        (err, results) => {
            if (err) {
                console.error("Erreur BDD :", err);
                return res.status(500).json({ erreur: "Erreur BDD" });
            }

            res.json(results);
        }
    );
});

app.post("/api/hint", (req, res) => {

    const { partieId, id, reponse } = req.body;

    // Récupère le prix du produit
    db.query(
        "SELECT prix FROM produit WHERE id = ?",
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

            const prix = Number(results[0].prix);
            const reponse_joueur = Number(reponse);

            let message;

            if (reponse_joueur < prix) {
                message = "more than " + reponse_joueur;
            }
            else if (reponse_joueur > prix) {
                message = "less than " + reponse_joueur;
            }
            else {
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
        }
    );
});

app.post("/api/temperature", (req, res) => {

    const { partieId, id, reponse } = req.body;

    // Récupère le prix
    db.query(
        "SELECT prix FROM produit WHERE id = ?",
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

            const prix = Number(results[0].prix);
            const reponse_joueur = Number(reponse);
            const difference = Math.abs(reponse_joueur - prix);

            let message;
            let couleur;

            if (difference < 1) {
                message = "very hot at " + reponse_joueur;
                couleur = "red";
            }
            else if (difference < 4) {
                message = "hot at " + reponse_joueur;
                couleur = "orange";
            }
            else if (difference < 8) {
                message = "cold at " + reponse_joueur;
                couleur = "blue";
            }
            else {
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
        }
    );
});

app.post("/api/verifier", (req, res) => {

    const { partieId, id, reponse } = req.body;

    // Récupère le prix du produit
    db.query(
        "SELECT prix FROM produit WHERE id = ?",
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

            const prix = Number(results[0].prix);
            const reponse_joueur = Number(reponse);

            // Calcul des points
            let points = (
                1 - Math.abs((reponse_joueur * 100 / prix) - 100) / 100
            ) * 4;

            points = Math.max(0, points);

            // Calcul de l'écart
            const ecart = Math.abs(
                Math.round((reponse_joueur * 100 / prix) - 100)
            );

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
        }
    );
});

app.get("/api/partie/:id", (req, res) => {

    const partieId = req.params.id;

    db.query(
        `SELECT score, round, hint_count, temp_count
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

    db.query(
        `INSERT INTO partie
        (score, round, hint_count, temp_count)
        VALUES (0, 1, 2, 2)`,
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

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});