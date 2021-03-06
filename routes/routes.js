
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const  bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Shoaibisagoodb$oy';


// ROUT 1: Create a User using POST "/api/auth/Createuser ". No login required
 router.post('/createuser',[
  body('name','Enter a valid name').isLength({ min: 3 }),
  body('email','Enter a valid email').isEmail(),
  body('password','Password must be atleast 5 character').isLength({ min: 5 }),
] ,async (req,res)=>{
 // if  there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // check  whether the user with this email exists
  try {


  let user = await User.findOne({email:req.body.email});
  if(user){
    return res.status(400).json({error:"sorry a user with this email already exists"})
  }

  const salt = await bcrypt.genSalt(10);
  const  secpass = await bcrypt.hash(req.body.password,salt) ;

  // Create a new user
   user = await User.create({
    name: req.body.name,
    password: secpass,
    email: req.body.email,
    })
    const data ={
      user:{
        id:user.id
      }
    }
    const authtoken = jwt.sign(data,JWT_SECRET);
    
    res.json({authtoken})
   //res.json(user)

  } catch(error){
    console.error(error.message);
    res.status.error(500).send("Internal server Error");
  }
} )
// ROUT 2: Authentication a user  using POST "/api/auth/login ". No login required
 router.post('/login',[
 // body('name','Enter a valid name').isLength({ min: 3 }),
  body('email','Enter a valid email').isEmail(),
  body('password','password can not be blank').exists(),
] ,async (req,res)=>{
 // if  there are errors, return Bad request and the errors
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
 }

 const  {email, password} = req.body;
 try{
  let user = await User.findOne({email});
  if(!user){
    return res.status(400).json({error:"Pleace try to login with correct credentials"});
  }

  const passwordCompare = await bcrypt.compare(password,user.password);
  if(!passwordCompare){
    return res.status(400).json({error:"Pleace try to login with correct credentials"});
  }

  const data = {
    user:{
      id:user.id
    }
  }
  const authtoken = jwt.sign(data,JWT_SECRET);
   
  res.json({authtoken})

 }catch (error){
  console.error(error.message);
  res.status.error(500).send("Internal server Error");
   
 }

})

// ROUT 3: Get loggedin user Detail using POST "/api/auth/getuser". login required
router.post('/getuser',fetchuser,async (req,res)=>{

try {
  userId = req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user)
} catch (error) {
  console.error(error.message);
  res.status.error(500).send("Internal server Error");
}
 })
module.exports = router