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

function fail(req, res, status, message, page, code) {
    if (req.is("json")) {
        return res.status(status).json({ message });
    }
    return res.redirect(`${page}?error=${code}`);
}

router.get("/register", (req, res) => {
    res.render("register", {
        avatars,
        avatar: avatars[0]
    });
});

/**
 * @openapi
 * /register:
 *   post:
 *     summary: "Creates a new user account"
 *     description: |
 *       Creates a new user with a hashed password, username, avatar and a mail, then redirects to the login page.
 *
 *       **Body parameters (form or JSON):**
 *       - `name` (string) : nickname of the user
 *       - `email` (string) : email of the user
 *       - `password` (string) : password of the user, stored hashed with bcrypt
 *       - `avatar` (string, optional) : path of the chosen avatar, from `/images/avatars/avatar1.png` to `/images/avatars/avatar14.png`
 *     tags: ["Utilisateur"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: "#/components/schemas/RegisterBody"
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterBody"
 *     responses:
 *       302:
 *         description: "Account created, redirects to /login"
 *       409:
 *         description: "Email or nickname already taken"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, enum: ["Email already taken", "Nickname already taken"], example: "Email already taken" }
 *       500:
 *         description: "Database or hashing error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An error occurred" }
 * components:
 *   schemas:
 *     RegisterBody:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name: { type: string, description: "Nickname of the user", example: "Player1" }
 *         email: { type: string, format: email, description: "Email of the user", example: "player1@mail.com" }
 *         password: { type: string, format: password, description: "Password of the user", example: "motdepasse" }
 *         avatar: { type: string, description: "Path of the chosen avatar", default: "/images/avatars/avatar1.png", example: "/images/avatars/avatar3.png" }
 */
router.post("/register", (req, res) => {
    const { name, email, password, avatar } = req.body;
    const avatarChoisi = avatars.includes(avatar) ? avatar : avatars[0];

    db.query(
        "SELECT email, nickname FROM users WHERE email = ? OR nickname = ?",
        [email, name],
        (error, results) => {
            if (error) {
                console.error(error);
                fail(req, res, 500, "An error occurred", "/register", "server");
            } else if (results.some((user) => user.email === email)) {
                fail(req, res, 409, "Email already taken", "/register", "email");
            } else if (results.length > 0) {
                fail(req, res, 409, "Nickname already taken", "/register", "nickname");
            } else {
                bcrypt
                    .hash(password, 10)
                    .then((hash) => {
                        db.query(
                            "INSERT INTO users (nickname,email,hash_password,avatar) VALUES (?,?,?,?)",
                            [name, email, hash, avatarChoisi],
                            (error) => {
                                if (error) {
                                    console.error(error);
                                    fail(req, res, 500, "An error occurred", "/register", "server");
                                } else {
                                    return res.redirect("/login?registered=1");
                                }
                            }
                        );
                    })
                    .catch((err) => {
                        console.error(err);
                        fail(req, res, 500, "An error occurred", "/register", "server");
                    })  
            }
        }
    );
});

/**
 * @openapi
 * /login:
 *   post:
 *     summary: "Log in a user"
 *     description: |
 *       Checks the email and password, opens a session (cookie `connect.sid`) then redirects to the home page.
 *
 *       **Body parameters (form or JSON):**
 *       - `email` (string) : email of the user
 *       - `password` (string) : password of the user
 *     tags: ["Utilisateur"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: "#/components/schemas/LoginBody"
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginBody"
 *     responses:
 *       302:
 *         description: "Logged in, session opened and redirects to /dashboard"
 *       401:
 *         description: "Email or password incorrect (JSON if the email is unknown, plain text if the password is wrong)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Email or password incorrect" }
 *           text/plain:
 *             schema: { type: string, example: "Email or password incorrect" }
 *       500:
 *         description: "Database or hashing error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An error occurred" }
 *           text/plain:
 *             schema: { type: string, example: "An error occurred" }
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email, description: "Email of the user", example: "player1@mail.com" }
 *         password: { type: string, format: password, description: "Password of the user", example: "motdepasse" }
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *       description: "Session cookie set by POST /login"
 */
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (error, results) => {
        if (error) {
            console.error(error);
            fail(req, res, 500, "An error occurred", "/login", "server");
        } else if (results.length === 0) {
            fail(req, res, 401, "Email or password incorrect", "/login", "invalid");
        } else {
            const user = results[0];
            const hash_password = user.hash_password;
            bcrypt.compare(password, hash_password, (err, response) => {
                if (err) {
                    console.error(err);
                    return fail(req, res, 500, "An error occurred", "/login", "server");
                }

                if (!response) {
                    return fail(req, res, 401, "Email or password incorrect", "/login", "invalid");
                }
                req.session.userId = user.id;
                req.session.nickname = user.nickname;
                req.session.avatar = user.avatar;
                if(user.user_role === "Admin"){
                    req.session.isAdmin = true;
                }
                else{
                    req.session.isAdmin = false;
                }
                return res.redirect("/dashboard?login=1");
            });
        }
    });
});

/**
 * @openapi
 * /logout:
 *   post:
 *     summary: "Log out the user"
 *     description: "Destroys the session, deletes the connect.sid cookie then redirects to the home page."
 *     tags: ["Utilisateur"]
 *     responses:
 *       302:
 *         description: "Logged out, redirects to /"
 *       500:
 *         description: "Session could not be destroyed"
 *         content:
 *           text/plain:
 *             schema: { type: string, example: "Log-off error" }
 */
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