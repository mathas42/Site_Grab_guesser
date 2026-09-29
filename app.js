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
    db.query("SELECT * FROM produit", (err, results) => {
        if (err) {
            console.error("Erreur BDD :", err);
            return res.status(500).json({ erreur: "Erreur BDD" });
        }

        res.json(results);
    });
});


app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});