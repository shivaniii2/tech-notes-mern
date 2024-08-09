const {format} = require('date-fns');
const {v4:uuid} = require('uuid');
const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');
const logFolder = path.join(__dirname , '../logs');


const logEvents = async (message,logFileName) => {
    const dateTime = format(new Date() , 'yyyy-MM-dd HH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`
    // Here \t in the string represents a tab character which is used to create space between items to more the logEntry more readable.
    try{
        if(!fs.existsSync(logFolder)){
            await fsPromise.mkdir(logFolder)
        }
        await fsPromise.appendFile(path.join(logFolder,logFileName),logItem)
    }catch(err){
        console.error(err)
    }
}


const loggerMiddleware = (req, res, next) =>{
    logEvents(`${req.method}\t${req.url}`, 'reqLog.log');
    console.log(`${req.method}\t${req.url}`)
    next()
}


module.exports = {logEvents , loggerMiddleware}
// Using named export here as there are multiple modules to be exported from this one file.