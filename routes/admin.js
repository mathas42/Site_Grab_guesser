const express = require("express");

const router = express.Router();
const db = require("../database");

router.use((req, res, next) => {
    if (!req.session.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
});

router.get('/users', (req, res) =>{
    const search = String(req.query.search || "");

    let sql = 'SELECT id, user_role, nickname, email, creation_date FROM users';
    const params = [];

    if(search !== ""){
        sql += ' WHERE nickname LIKE ?';
        params.push(`%${search}%`);
    }

    db.query(
        sql, params, (error, results) =>{
            if(error){
                console.error(error);
                res.status(500).json({message : "An error occurred"});
            }
            else{
                res.json(results)
            }
        }
    )
})

router.patch("/users/:id", (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const id = Number(req.params.id);
    const role = req.body?.role;
    const nickname = req.body.nickname;

    if (role !== "Player" && role !== "Admin") {
        return res.status(400).json({ message: "Invalid role" });
    }

    if (!nickname || nickname.length > 30) {
        return res.status(400).json({ message: "Nickname must be between 1 and 30 characters" });
    }

    db.query(
        "UPDATE users SET user_role = ?, nickname = ? WHERE id = ?",
        [role, nickname, id],
        (error, result) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "This nickname is already taken" });
                }
                console.error(error);
                return res.status(500).json({ message: "An error occurred" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ message: "User updated" });
        }
    );
});

router.delete("/users/:id", (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const id = Number(req.params.id);

    if (id === req.session.userId) {
        return res.status(400).json({ message: "You cannot delete your own account" });
    }

    db.query("DELETE FROM users WHERE id = ?", [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted" });
    });
});

module.exports = router;
