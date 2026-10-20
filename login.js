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

router.post('/login', (req, res)=>{
    const {email, password} = req.body;
    db.query('SELECT * FROM USERS WHERE email = ? AND password = ?', [email, password], (error, results)=>{
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