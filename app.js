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

    const { id, reponse } = req.body;

    db.query(
        "SELECT prix FROM produit WHERE id = ?",
        [id],
        (err, results) => {

            if (err) {
                console.error("Erreur BDD :", err);
                return res.status(500).json({ erreur: "Erreur BDD" });
            }

            if (results.length === 0) {
                return res.status(404).json({ erreur: "Produit introuvable" });
            }

            const prix = Number(results[0].prix);
            const reponse_joueur = Number(reponse);

            if (reponse_joueur < prix) {
                res.json({ message: "more than " + reponse_joueur });
            } 
            else if (reponse_joueur > prix) {
                res.json({ message: "less than " + reponse_joueur });
            } 
            else {
                res.json({ message: "that's it ! " + reponse_joueur });
            }
        }
    );
});

app.post("/api/temperature", (req, res) => {

    const { id, reponse } = req.body;

    db.query(
        "SELECT prix FROM produit WHERE id = ?",
        [id],
        (err, results) => {

            if (err) {
                console.error("Erreur BDD :", err);
                return res.status(500).json({ erreur: "Erreur BDD" });
            }

            if (results.length === 0) {
                return res.status(404).json({ erreur: "Produit introuvable" });
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

            res.json({
                message: message,
                couleur: couleur
            });
        }
    );
});

app.post("/api/verifier", (req, res) => {

    const { id, reponse } = req.body;

    db.query(
        "SELECT prix FROM produit WHERE id = ?",
        [id],
        (err, results) => {

            if (err) {
                console.error("Erreur BDD :", err);
                return res.status(500).json({ erreur: "Erreur BDD" });
            }

            if (results.length === 0) {
                return res.status(404).json({ erreur: "Produit introuvable" });
            }

            const prix = Number(results[0].prix);
            const reponse_joueur = Number(reponse);

            // calcul des points
            let points = (
                1 - Math.abs((reponse_joueur * 100 / prix) - 100) / 100
            ) * 4;

            points = Math.max(0, points);

            // calcul de l'écart en %
            const ecart = Math.abs(
                Math.round((reponse_joueur * 100 / prix) - 100)
            );

            res.json({
                points: points,
                prix: prix,
                ecart: ecart
            });
        }
    );
});


app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});