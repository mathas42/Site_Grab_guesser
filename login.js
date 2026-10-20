const express = require('express');

const router = express.Router();
const db = require("./database");


router.post('/register', (req,res)=>{
    const {name, email, password} = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results)=>{
        if(error){
            console.error(error);
            res.status(500).json({message : 'An error occurred'});
        }
        else if(results.length > 0){
            res.status(400).json({message : 'Email already taken'});
        }
        else{
            db.query('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, password],
            (error)=>{
                if(error){
                    console.error(error);
                    res.status(500).json({message : 'An error occurred'});
                }
                else{
                    res.status(200).json({message : 'User registereed successfully'});
                }
            });
        }
    });
});

module.exports = router;