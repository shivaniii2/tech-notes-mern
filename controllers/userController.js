const Note = require('../Models/Note');
const User = require('../Models/User')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');


const getAllUsers = asyncHandler(async(req , res) =>{
    const users = await User.find().lean()
    if(!users?.length ){
        return res.status(400).json({message : 'No user found'})
    }
   return res.json(users)
    
})


const createNewUser = asyncHandler(async(req , res ) =>{
    const {username , password , roles} = req.body
    
    // some validations before creating a new user 
    if(!username || !password || !Array.isArray(roles) || !roles.length ){
        return res.status(400).json({message : "ALL FIELDS ARE REQUIRED"})
    }
    // check if username already exists 
    const duplicate = await User.findOne({username}).lean().exec()   // exec() - To execute the query
    if(duplicate){
        return res.status(409).json({message : "Duplicate username"})
    }
    
    // Hash password using bcrypt
    const hashedpasswrd = await bcrypt.hash(password , 10)
    const userObject = {username , "password" : hashedpasswrd , roles} 
    const user = await User.create(userObject);
    if(user){
       return res.status(200).json({message :`new user is created successfully`})
    }else{
       return res.status(200).json({message :"Inavalid user details recieved "})
    }
    
})


const updateUser = asyncHandler(async(req, res) =>{
    const {id , username , password  ,roles ,  active  } = req.body ;
    //confirm data
    if(!username|| !Array.isArray(roles) || typeof active !== 'boolean'){
        return res.status(400).json({message : "All Fields are required"})
    }
    
    
    const user = await User.findById(id).exec() // Not using lean as we do want a document to be returned with methods such as save() and not just a js object.
    if(!user){
       return res.status(400).json({message :"User not found"})
    }
    
    
     // check for duplicates so that we only update the current user and not the other user with same name.
     const duplicate = await User.findOne({username}).lean()
     console.log(duplicate,"d")
     console.log(id ,"id")
     if(duplicate && duplicate._id.toString() == id){
       return res.status(409).json({message : "Duplicate username"})
     }
     
     user.username = username
     user.roles = roles
     user.active = active
     if(password){
        // Hash the password
        const hashedpasswrd = await bcrypt.hash(password, 10)
        user.password = hashedpasswrd
        
     }
     
     const updatedUser = await user.save()
    return res.json({message : `${updatedUser.username} is updated`} )
      
    
})

const deleteUser = asyncHandler(async(req,res) =>{
    const{username ,id} = req.body
    if(!id){
      return  res.status(400).json({message : "User ID required"})
    }
    
    // if notes are assigned to that user we are trying to delete then don't delete logic
    
    const note = await Note.findOne({user : id}).lean().exec()
    if(note){
       return  res.status(400).json({message : "User has assigned notes"})
    }
    
    const user = await User.findById(id).exec()
    if(!user){
        return  res.status(400).json({message : "User not found"})
    }
    
    const result = await user.deleteOne()
    return res.status(200).json({message : `${username} with ${id} is deleted`})
    
})



module.exports = {getAllUsers , createNewUser , updateUser , deleteUser}