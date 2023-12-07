const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/user.model')
require('dotenv').config(); 
const PORT = process.env.PORT || 8082;

app.use(cors());
app.use(express.json()); 
mongoose.connect(process.env.CONN_STRING);

app.use(
    cors({
      origin: ["http://localhost:3000", process.env.ORIGIN],
    })
  );

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/user/register', async (req, res) => {
    try{
        const user = await User.create({
            name: req.body.name, 
            email: req.body.email, 
            password: req.body.password,
            usertype: req.body.usertype,
        })
        res.json({status: 'ok', user: user})
    }catch(err){
        res.json({status: 'error', error: "this user already exists"})
    }
    
})

app.post('/user/login', async (req, res) => {
    try{
        const user =  await User.findOne({
            email: req.body.email, 
            password: req.body.password,
        })
        if(user){
            return res.json({status: 'ok', user: true, name: user.name, user: user})
        }else{
            res.json({status: 'user error', user:false})
        }
    }catch(err){
        res.json({status: 'error', error: err})
    }
    
})



// return list of all users in the db
app.get('/usersList', async function(req, res) {
    try{
        const user = await User.find();
        res.json({status: "ok", users: user});
    }catch(err){
        res.json({status: "error", error: err})
    }
});

app.delete('/deleteUser', async (req,res) => {
    const userName = req.body.name;
    const userEmail = req.body.email;
    try{
        const userToDelete = await User.deleteOne(el => el.name === userName && el.email === userEmail);
        res.json({status: "ok", users: userToDelete})
    }
    catch(err){
        res.json({status: "error", error: err})
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



