const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
     // Check if the origin is in the allowedOrigins list or if there's no origin (same-origin request)
    origin : (origin , callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            callback(null , true) // Allow the request
        }else{
            callback(new Error('Not allowed by CORS') , ) // Reject the request
        }
    },
    credentials : true , // Allow cookies and authentication headers
    optionsSuccessStatus : 200 // Ensure pre-flight requests return 200 status
}


module.exports = corsOptions;



// corsOption is an object with all the allowed headers , origin , requests etc.