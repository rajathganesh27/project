const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const registerUser = asyncHandler(async(req,res) =>{
    const {userName,email,password,phoneNumber,dob,gender} = req.body

    if(!userName || !email || !password|| !phoneNumber|| !dob|| !gender){
        res.status(400)
        throw new Error('Please add all field')
    }
    
    const userExists = await User.findOne({email})
    if(userExists){
        res.status(409)
        throw new Error('user exists')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const user = await User.create({
        userName,email,password: hashedPassword,phoneNumber,dob,gender
    })

    if(user){
        res.status(201).json({
            _id:user.id,
            name:user.userName,
            email:user.email,
            token: generateToken(user._id),
        })
    } else{
        res.status(400)
        throw new Error('invalid user data')
    }

    
})

const loginUser = asyncHandler(async(req,res) =>{
    const {email,password} =req.body

    const user = await User.findOne({email})
    if(user && (await bcrypt.compare(password, user.password))){
        res.json({
            _id:user.id,
            name:user.userName,
            email:user.email,
            token: generateToken(user._id),
        })
    } else{
        res.status(400)
        throw new Error('invalid credentials')
    }
})

const getMe = asyncHandler(async (req, res) => {
    // Assuming User is the mongoose model for your users
    const user = await User.findById(req.user.id);
  
    if (!user) {
      // Handle the case where the user is not found
      return res.status(404).json({ error: 'User not found' });
    }
  
    const { _id, userName, email, phoneNumber, dob, gender } = user;
  
    res.status(200).json({
      id: _id,
      userName,
      email,
      phoneNumber,
      dob,
      gender,
    });
  });


  

// jwt

const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: '30d',
    })
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
}