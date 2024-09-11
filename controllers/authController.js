const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const User = require('../Models/User');
const bcrypt = require('bcrypt')

// Let us understand Jwt concept in brief through this project (jwt.txt)


const login = asyncHandler(async(req, res) => {
  console.log("hii")
  const {username , password} = req.body;
  if(!username || !password) {
    return res.status(400).json({message : "All Fields are required"})
  }
  
  const foundUser = await User.findOne({username}).exec();
  if(!foundUser || !foundUser.active){
    return res.status(401).json({message : "unautrhorised"})
  }
  
  const match = bcrypt.compare(password , foundUser.password)
  //bcrypt.compare() is a method provided by the bcrypt library, which is commonly used for hashing passwords in a secure manner.
  //It takes two arguments:The plain-text password entered by the user (password in this case) and The hashed password retrieved from the database (foundUser.password).
  // The purpose of bcrypt.compare() is to check whether the plain-text password, when hashed, matches the hashed password stored in the database.
  
  
  if(!match) return res.status(401).json({message : "Unauthorised"})
    
    
    // A JWT (JSON Web Token) is generated using the jwt.sign() function.
    const accessToken = jwt.sign(
      
      // Default headers will be there as no headers are specifically defined
    {
       
        userInfo: {
            "username" : foundUser.username,
            "roles" : foundUser.roles
        }
     }   , // payload 
     process.env.SECRET_ACCESS_TOKEN,  //secret key to be fed to HMAC algo to signbase 64 encoded headers and payload
        
     { expiresIn: '15m' }
        
    )
    
    
    const refreshToken = jwt.sign(  // our refresh token is also Jwt format
        {
            "username" : foundUser.username
        },
        process.env.SECRET_REFRESH_TOKEN,
        { expiresIn: '7d' }
    )
    
    res.cookie('jwt' , refreshToken , {
        httpOnly : true,
        secure : true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    })
    
    //res.cookie('jwt', refreshToken): The Refresh Token is stored in a cookie named 'jwt'.
    // Cookie Options:
    // httpOnly: true: The cookie is only accessible via the server (not client-side JavaScript), which prevents attacks like XSS (Cross-Site Scripting).
    // secure: true: The cookie will only be sent over HTTPS (secure connections).
    // sameSite: 'None': This allows the cookie to be sent with cross-site requests, needed for certain environments (like APIs or when the frontend and backend are on different domains).
    // maxAge: 7 * 24 * 60 * 60 * 1000: The cookie will expire in 7 days, matching the expiration time of the Refresh Token.
    
    
    
    
    res.json({accessToken})
    
})


const refresh = ( req , res) => {
  const cookies = req.cookies
  if(!cookies?.jwt) return res.status(401).json({message : 'Unauthorised'})
    const refreshToken = cookies.jwt
  
  jwt.verify(
    refreshToken,
    process.env.SECRET_REFRESH_TOKEN ,
    asyncHandler(async(err,decode) => {
      if(err) return res.status(403).json({message: "Forbidden"})
        
        const foundUser = User.findOne({username : decode.username }).exec()
        if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })
        const accessToken = jwt.sign(
          {
            userInfo: {
              username: foundUser.username,
              password: foundUser.password,
            },
          },
          process.env.SECRET_ACCESS_TOKEN,
          { expiresIn: "15m" }
        );
        res.json({accessToken})
       
    })
    
    
  )
  
    
}



const logout = (req , res) => {
  const cookies = req.cookies;
  if(!cookies?.jwt) return res.sendStatus(204) // No content found to be cleared
  res.clearCookie('jwt' , {
    httpOnly : true ,
    sameSite : 'None' ,
    secure : true
  })
  
  res.json({message : "cookies cleared"})
    
}


module.exports = {login, refresh , logout}