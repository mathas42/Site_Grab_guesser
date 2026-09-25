const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Erreur :", err);
        return;
    }

    console.log("Connecté à MySQL !");
});

db.query(
    "SELECT * FROM produit",
    (err, results) => {
        if (err) {
            console.error(err);
            return err;
        }

        console.log(results)
        return results;;
    },
);

module.exports = db;