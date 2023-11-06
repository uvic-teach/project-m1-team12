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
            return res.json({status: 'ok', user: true, name: user.name})
        }else{
        res.json({status: 'error', user:false})
        }
    }catch(err){
        res.json({status: 'ok', error: err})
    }
    
})

app.get('/user/getID')

// get name and ID of all residents...

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



