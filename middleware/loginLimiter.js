const rateLimit = require('express-rate-limit')
// express-rate-limit package :  restricts the number of login requests a user can make in a given time window

const {logEvents} = require('./logger')


const loginLimiter = rateLimit({
    
    // configurations 
    windowMs: 60 * 1000, // 1 minute : It defines the time window during which a user is allowed a maximum number of requests.
    max: 5, // The maximum number of login requests allowed from a single IP address in the specified window is set to 5. After exceeding this limit, the rate limiter is triggered.
    message:
    { message: 'Too many login attempts from this IP, please try again after a 60 second pause' },
    handler : (req , res , next , options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
            
            res.status(options.statusCode).send(options.message)
        
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
     
})


module.exports = loginLimiter