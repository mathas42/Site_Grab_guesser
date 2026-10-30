const express = require("express");

const router = express.Router();
const db = require("../database");
const bcrypt = require("bcrypt");

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

router.get("/register", (req, res) => {
    res.render("register", {
        avatars,
        avatar: avatars[0]
    });
});

router.post("/register", (req, res) => {
    const { name, email, password, avatar } = req.body;

    // Vérifier que l'avatar choisi est autorisé
    const avatarChoisi = avatars.includes(avatar) ? avatar : avatars[0];

    db.query(
        "SELECT email, nickname FROM users WHERE email = ? OR nickname = ?",
        [email, name],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ message: "An error occurred" });
            } else if (results.some((user) => user.email === email)) {
                res.status(409).json({ message: "Email already taken" });
            } else if (results.length > 0) {
                res.status(409).json({ message: "Nickname already taken" });
            } else {
                bcrypt
                    .hash(password, 10)
                    .then((hash) => {
                        db.query(
                            "INSERT INTO users (nickname,email,hash_password,avatar) VALUES (?,?,?,?)",
                            [name, email, hash, avatar],
                            (error) => {
                                if (error) {
                                    console.error(error);
                                    res.status(500).json({ message: "An error occurred" });
                                } else {
                                    return res.redirect("/login");
                                }
                            }
                        );
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(500).json({ message: "An error occurred" });
                    });
            }
        }
    );
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred" });
        } else if (results.length === 0) {
            res.status(401).json({ message: "Email or password incorrect" });
        } else {
            const user = results[0];
            const hash_password = user.hash_password;
            bcrypt.compare(password, hash_password, (err, response) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("An error occurred");
                }

                if (!response) {
                    return res.status(401).send("Email or password incorrect");
                }
                req.session.userId = user.id;
                req.session.nickname = user.nickname;
                req.session.avatar = user.avatar;
                return res.redirect("/index");
            });
        }
    });
});

router.post("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send("Log-off error");
            }
            res.clearCookie("connect.sid");
            res.redirect("/");
        });
    } else {
        res.redirect("/");
    }
});

module.exports = router;
