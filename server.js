require('dotenv').config();
const express = require('express')
const app = express();
const path = require('path');
const PORT = 3500;
const cookieParser = require('cookie-parser');
const cors = require('cors') ;
const {loggerMiddleware} = require('./middleware/logger'); // Named import
const errorHandler = require('./middleware/errorHandler') // Default import
const routes = require('./routes/root');
const users = require('./routes/userRoute')
const notes = require('./routes/noteRoute')
const auth = require('./routes/authRoute')
const corsOptions = require('./config/corsOptions');
const {connectDb} = require('./config/dbConnection')


const startApp = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`App is listening on the ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};
startApp()

// custom logger middleware
app.use(loggerMiddleware);
app.use(cors(corsOptions));
console.log(process.env.NODE_ENV);


// Built in middleware to parse the json in the request recieved and to serve the static files.
app.use(express.json())
app.use('/',express.static(path.join(__dirname,'public')));

// Middleware to parse the cookies in the header of the recieved request and is a third party middleware(installed from npm)
app.use(cookieParser())

// Route handler for / routes 
app.use('/',routes);
// Route handler for /users route
app.use('/users' ,users )

// Route handler for /notes route
app.use('/notes' , notes)

// Route handler for /auth route
app.use('/auth' ,  auth)

app.all('*', (req , res ) => {
    res.status(404);
    res.sendFile(path.join(__dirname , './views/404.html'))
})

//custom error handler middleware function
app.use(errorHandler)


