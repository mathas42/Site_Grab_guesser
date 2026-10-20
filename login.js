const express = require('express');

const app = require('./app');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'',
    database:'projet_site'
})

app.post('/register', (req,res)=>{
    const {name, email, password} = req.body;

    pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results)=>{
        if(error){
            console.error(error);
            res.status(500).json({message : 'An error occurred'});
        }
        else if(results.length > 0){
            res.status(400).json({message : 'Email already taken'});
        }
        else{
            pool.query('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, password]),
            (error)=>{
                if(error){
                    console.error(error);
                    res.status(500).json({message : 'An error occurred'});
                }
                else{
                    res.status(200).json({message : 'User registereed successfully'});
                }
            };
        }
    });
});