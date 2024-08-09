const {logEvents} = require('./logger')

const errorHandler = (err , req , res,  next ) =>{
    logEvents(`${err.name} : ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}` , 'errorLog.log')
    console.log(err.stack);
    const status = res.statusCode ? res.statusCode : 500;
    res.status(status);
    res.json({message : err.message}); 
}
module.exports = errorHandler;
// This is a default export here as you have only one module to export from this file.