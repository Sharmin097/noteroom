import express, { static as _static } from 'express'
import { join } from 'path'
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import cookieParser from 'cookie-parser'
import session from 'express-session'
import { connect } from 'mongoose'
import _pkg from 'body-parser';
const { urlencoded } = _pkg;
import fileUpload from 'express-fileupload'
import cors from 'cors'
import pkg from 'connect-mongo';
const { create } = pkg;
import chalk from 'chalk';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggers/swaggerOptions';

import postApiRouter from './services/apis/post.js';
import feedApiRouter from './services/apis/feed.js';
import seacrhApiRouter from './services/apis/search.js';
import profileApiRouter from './services/apis/profile.js';
import notificationApiRouter from './services/apis/notifications.js';
import requestsApiRouter from './services/apis/requests.js';
import authApiRouter from './services/apis/auth.js';
import uploadApiRouter from './services/apis/upload.js';
import mcqApiRouter from './services/apis/mcq';
import friendsApiRouter from './services/apis/friends';

config({ path: join(__dirname, '.env') });

const app = express()
const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
const url = (process.env.DEVELOPMENT && process.env.DEVELOPMENT === "true") ? process.env.MONGO_URI_DEV : process.env.MONGO_URI

connect(url).then(() => {
    console.log(chalk.cyan(`[-] development mode: ${chalk.yellow(process.env.DEVELOPMENT)}`))
    if (process.env.DEVELOPMENT && process.env.DEVELOPMENT === "true") {
        console.log(chalk.cyan(`[-] using local mongodb: ${chalk.yellow(url)}`))
    } else {
        console.log(chalk.cyan(`[-] using remote mongodb: ${chalk.yellow(url)}`))
    }
})

const port = process.env.PORT
const staticPath = join(__dirname, "../../frontend/dist")
const allowedHosts = JSON.parse(process.env.ALLOWED_HOSTS)

app.use(cors({
    origin: allowedHosts,
    credentials: true
}))

app.use(express.json()); 
app.use(express.static(staticPath))
app.use(urlencoded({ extended: true })) 
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: create({
        mongoUrl: url,
        ttl: 60 * 60 * 720
    }),
    cookie: {
        httpOnly: true,   
        secure: false,   
        maxAge: 1000 * 60 * 60 * 720
    }
}));

app.use(cookieParser()) 
app.use(fileUpload()) 

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', profileApiRouter(io))
app.use('/api/posts', postApiRouter(io))
app.use('/api/notifications', notificationApiRouter(io))
app.use('/api/requests', requestsApiRouter(io))
app.use('/api/feed', feedApiRouter(io))
app.use('/api/search', seacrhApiRouter(io))
app.use('/api/auth', authApiRouter(io))
app.use('/api/upload', uploadApiRouter(io))
app.use('/api/mcq/', mcqApiRouter(io))
app.use('/api/friends', friendsApiRouter(io))
app.get('/logout', (req, res) => {
    try {
        req.session.destroy(error => {
            res.clearCookie('studentID')
            res.clearCookie('username')
            res.clearCookie('connect.sid')
            res.json({ ok: true })
        })
    } catch (error) {
        res.json({ ok: false })
    }
})


app.get("*", (req, res) => {
    res.sendFile(join(staticPath, 'index.html'))
})


export let userSocketMap: Map<string, string> = new Map()
io.on('connection', (socket) => {
    let studentID = <string>socket.handshake.query.studentID
    if (studentID) {
        userSocketMap.set(studentID, socket.id)
    }

    socket.on('disconnect', () => {
        userSocketMap.forEach((sockID, studentID) => {
            if (sockID === socket.id) {
                userSocketMap.delete(studentID)
            }
        })
    })
})

server.listen(port, () => {
    console.log(chalk.cyan(`[-] server is listening on: ${chalk.yellow(`http://localhost:${port}`)}`));
})
