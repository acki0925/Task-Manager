require('dotenv').config({path:'/home/bala/Desktop/Office_work/Task_manager/src/config/.env'})
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('./middleware/logger')
const errorHandler = require('./middleware/error')

require('./db/mongoose')

const userRouter = require('./routers/user')
const userSubscriptionRouter = require('./routers/user_subscription')
const projectRouter = require('./routers/project')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT 

app.use(express.json())
app.use(cookieParser())

app.use(logger)


/*app.use(session({
    name: 'kirthivasan', // name of the cookie
    secret: process.env.SECRET, // secret that makes the cookie effective
    resave: false, // resave to the session
    saveUninitialized: true, // it should be false in production
    cookie:{
        maxAge: 1000*60*60*3, // 3 hours only validity
        secure: false, // for production set to true for https only access
        httpOnly: true,
    }
}))*/

app.use(userRouter)
app.use(userSubscriptionRouter)
app.use(projectRouter)
app.use(taskRouter)

app.use(errorHandler)

const server = app.listen(port, ()=>{
    console.log('server is up on the port'+ port)
})

// Handle unhandled promise rejections 
process.on('unhandledRejection', (err, Promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});