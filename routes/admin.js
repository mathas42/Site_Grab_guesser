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
    const search = String(req.query.search || "").trim();

    let sql = 'SELECT id, user_role, nickname, email, creation_date FROM users';
    const params = [];

    if(search !== ""){
        sql += ' WHERE nickname LIKE ?';
        params.push(`%${search}%`);

        // On ne cherche par id que si la recherche contient uniquement des chiffres
        if(/^\d+$/.test(search)){
            sql += ' OR id = ?';
            params.push(search);
        }
    }

    db.query(
        sql,
        params,
        (error, results) =>{
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

module.exports = router;
