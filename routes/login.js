const express = require('express');

const router = express.Router();
const db = require("../database");
const bcrypt = require("bcrypt");


router.post('/register', (req,res)=>{
    const {name, email, password} = req.body;

    db.query('SELECT email, nickname FROM users WHERE email = ? OR nickname = ?', [email, name], (error, results)=>{
        if(error){
            console.error(error);
            res.status(500).json({message : 'An error occurred'});
        }
        else if(results.some(user => user.email === email)){
            res.status(409).json({message : 'Email already taken'});
        }
        else if(results.length > 0){
            res.status(409).json({message : 'Nickname already taken'});
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
                        return res.redirect("/login");
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
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results)=>{
        if(error){
            console.error(error);
            res.status(500).json({message:'An error occurred'});
        }
        else if(results.length === 0){
            res.status(401).json({message:'Email or password incorrect'});
        }
        else{
            const user = results[0];
            const hash_password = user.hash_password;
            bcrypt.compare(password, hash_password, (err, response)=>{
                if (err) {
                    console.error(err);
                    return res.status(500).send('An error occurred');
                }

                if (!response) {
                    return res.status(401).send('Email or password incorrect');
                }
                req.session.userId = user.id;
                req.session.nickname = user.nickname;
                return res.redirect('/index');
            });
        }
    });
});

router.post('/logout', (req, res) =>{
    if(req.session){
        req.session.destroy((err=>{
            if(err){
                return res.status(500).send("Log-off error")
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        }))
    }
    else{
        res.redirect('/');
    }
})



module.exports = router;