const express = require('express');

const router = express.Router();
const db = require("./database");
const bcrypt = require("bcrypt");


router.post('/register', (req,res)=>{
    const {name, email, password} = req.body;

    db.query('SELECT email, nickname FROM users WHERE email = ? OR nickname = ?', [email, name], (error, results)=>{
        if(error){
            console.error(error);
            res.status(500).json({message : 'An error occurred'});
        }
        else if(results.some(user => user.email === email)){
            res.status(400).json({message : 'Email already taken'});
        }
        else if(results.length > 0){
            res.status(400).json({message : 'Nickname already taken'});
        }
        else{
            bcrypt.hash(password, 10)
            .then(hash =>{
                db.query('INSERT INTO users (nickname,email,hash_password) VALUES (?,?,?)', [name, email, hash],
                (error)=>{
                    if(error){
                        console.error(error);
                        res.status(500).json({message : 'An error occurred'});
                    }
                    else{
                        res.status(200).json({message : 'User registered successfully'});
                    }
                });
            })
            .catch(err =>{
                console.error(err);
                res.status(500).json({message : 'An error occurred'});
            });
        }
    });
});

router.post('/login', (req, res)=>{
    const {email, password} = req.body;
    db.query('SELECT * FROM USERS WHERE email = ? AND hash_password = ?', [email, password], (error, results)=>{
        if(error){
            console.error(error);
            res.status(400).json({message:'An error occured'});
        }
        else if(results.length === 0){
            res.status(400).json({message:'e-mail' + email + 'does not exist'});
        }
        else if(results.length > 1){
            res.status(400).json({message:'Several users own this e-mail. How is this possible!!??'});
        }
        else{
            const user = results[0];
            const user_password = user.password;
            if(user_password === password){
                res.status(200).json({message:'Log-in successful'});
            }
            else{
                res.status(400).json({message:'Password is incorrect'});
            }
        }
    });
});

module.exports = router;