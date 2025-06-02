import { Router } from 'express';
import { Server } from 'socket.io';
import { OAuth2Client } from 'google-auth-library';
import { addUserProfile, getUserAuth, getUserVarification } from '../services/auth.service';
import { generateRandomUsername, joinLogContexts } from '../services/utils';
import { capitalize, sample } from "lodash"
import logger, { ContextType } from '../logger';



const router = Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export default function authApiRouter(io: Server, context: { rootContext: string }) {
    router.post("/signup", async (req, res) => {
        try {
            const displayname = req.body.displayname
            const email = req.body.email
            const password = req.body.password
            const username = req.body.username

            if (!(displayname && email && password)) {
                res.json({ ok: false, message: "Fill up the form to proceed" })
            } else {
                let identifier = generateRandomUsername(req.body.displayname.trim())
                let studentData = {
                    displayname: req.body.displayname.trim(),
                    email: req.body.email,
                    password: req.body.password,
                    studentID: identifier["userID"],
                    username: username.trim().length === 0 ? identifier["username"] : username,
                    authProvider: null,
                    onboarded: false
                }
                logger.info(`Got user data for signup`, { entity: 'api', root: joinLogContexts(context.rootContext, ['signup']), action: 'noteroom-signup-attempt' }, { email })

                const response = await addUserProfile(studentData)
                if (response.ok) {
                    const { data: user } = response
                    req.session["stdid"] = user["studentID"]
                    logger.info(`Signed up user and set session`, { entity: 'api', root: joinLogContexts(context.rootContext, ['signup', response.context]), action: 'noteroom-signup-success' }, { response: 'success', email })
                    res.json({ ok: true, userAuth: { studentID: user["studentID"], username: user["username"] } })
                } else {
                    if (response.error.code === 11000) {
                        const { keyPattern, keyValue } = response.error
                        const fieldName = Object.keys(keyPattern)[0] as string
                        if (fieldName !== "username") {
                            res.json({ ok: false, message: `${capitalize(fieldName)} is already registered` })
                        } else {
                            res.json({ ok: false, message: "Your username is already in use. We want you write a unique username", displayname })
                        }
                    } else {
                        logger.error(`Signup failure`, { entity: 'api', root: joinLogContexts(context.rootContext, ['signup', response.context]), action: 'noteroom-signup-failure' }, { response: 'failed', error: response.error.message, email })
                        res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
                    }
                }
            }
        } catch (error) {
            logger.error(`Signup failure`, { entity: 'api', root: joinLogContexts(context.rootContext, ['signup']), action: 'noteroom-signup-api-failure' }, { error: error.message })
            res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
        }
    })

    router.post("/login", async (req, res) => {
        try {
            let email = req.body.email
            let password = req.body.password

            if (email && password && email.length !== 0 && password.length !== 0) {
                let response = await getUserVarification(email)
                if (response.ok) {
                    const { data: student } = response
                    if (student["authProvider"] === null) {
                        if (password === student['studentPass']) {
                            req.session["stdid"] = student["studentID"];
                            logger.info(`NoteRoom Login`, { entity: 'api', root: joinLogContexts(context.rootContext, ['login', response.context]), action: 'noteroom-login-success' }, { response: 'success', email })
                            res.json({ ok: true, userAuth: { studentID: student["studentID"], username: student["username"] } });
                        } else {
                            res.json({ ok: false, message: "Incorrect password. Try again" })
                        }
                    } else if (student["authProvider"] === "google") {
                        res.json({ ok: false, message: "Invalid login method. Try using Google login" })
                    }
                } else {
                    if (response.code === "NO_EMAIL") {
                        res.json({ ok: false, message: "No student account associated with this email." })
                    } else if (response.code === "SERVER") {
                        logger.error(`Login failed`, { entity: 'api', root: joinLogContexts(context.rootContext, ['login', response.context]), action: 'noteroom-login-failure' }, { response: 'failed', error: response.error, email })
                        res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
                    }
                }
            }
        } catch (error) {
            logger.error('Login failed', { entity: 'api', root: joinLogContexts(context.rootContext, ['login']), action: 'noteroom-login-api-failure' }, { error: error.message })
            res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
        }
    })

    router.get("/session", async (req, res) => {
        try {
            if (req.session && req.session["stdid"]) {
                const studentID = req.session["stdid"]
                const response = await getUserAuth(studentID)
                if (response.ok) {
                    logger.info(`Got user auth`, { entity: 'api', root: joinLogContexts(context.rootContext, ['session', response.context]), action: 'session-success' }, { response: 'success', studentID })
                    res.json({ ok: true, userAuth: response.userAuth });
                } else {
                    logger.error(`Failed to get user auth`, { entity: 'api', root: joinLogContexts(context.rootContext, ['session', response.context]), action: 'session-failure' }, { response: 'failed', error: response.error.message , studentID })
                    res.json({ ok: false })
                }
            } else {
                logger.error(`Failed to get user auth, req.session or req.session.stdid was not found`, { entity: 'api', root: joinLogContexts(context.rootContext, ['session']), action: 'session-object-not-found' })
                res.json({ ok: false });
            }
        } catch (error) {
            logger.error(`Failed to get user auth`, { entity: 'api', root: joinLogContexts(context.rootContext, ['session']), action: 'session-api-failure' }, { error: error.message })
            res.json({ ok: false });
        }
    })

    router.post('/google', async (req, res: any) => {
        try {
            const { credential } = req.body;
            if (!credential) return

            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const email = payload.email;
            const displayName = payload.name;

            logger.info(`Google login attempt`, { entity: 'api', root: joinLogContexts(context.rootContext, ['google']), action: 'google-login-attempt' }, { email })

            const existingUser = await getUserVarification(email);

            if (existingUser.ok) {
                const student = existingUser.data;

                if (student.authProvider !== "google") {
                    return res.json({
                        ok: false,
                        message: "This email is registered with another method. Try NoteRoom login",
                    });
                }


                req.session.regenerate(() => {
                    req.session["stdid"] = student["studentID"];
                    logger.info(`Google login success`, { entity: 'api', root: joinLogContexts(context.rootContext, ['google', 'login', existingUser.context]), action: 'google-login-success' }, { response: 'success', email })
                    return res.json({
                        ok: true,
                        userAuth: {
                            studentID: student["studentID"],
                            username: student["username"],
                        },
                    });
                });

                return;
            }

            logger.info(`Attempting to signup via google`, { entity: 'api', root: joinLogContexts(context.rootContext, ['google', 'signup']), action: 'google-signup-attempt' }, { email })
            const identifier = generateRandomUsername(displayName.trim());
            const newUser = {
                displayname: displayName,
                email: email,
                password: null,
                studentID: identifier.userID,
                username: identifier.username,
                authProvider: "google",
                onboarded: false,
            };

            const response = await addUserProfile(newUser);

            if (response.ok) {
                const user = response.data;

                req.session.regenerate(() => {
                    req.session["stdid"] = user["studentID"];
                    logger.info(`Google signup success`, { entity: 'api', root: joinLogContexts(context.rootContext, ['google', 'signup', response.context]), action: 'google-signup-success' }, { response: 'success', email })

                    res.json({
                        ok: true,
                        userAuth: {
                            studentID: user["studentID"],
                            username: user["username"],
                        },
                    });
                });
            } else {
                logger.error(`Google signup failure`, { entity: 'api', root: joinLogContexts(context.rootContext, ['google', 'signup', response.context]), action: 'google-signup-failure' }, { response: 'failed', error: response.error.message, email })
                res.json({
                    ok: false,
                    message: "Something went wrong while creating your account.",
                });
            }
        } catch (error) {
            logger.error(`Google auth api failure`, { entity: 'api', root: joinLogContexts(context.rootContext, ['google', 'auth']), action: 'google-auth-api-failure' }, { error: error.message })
            res.json({
                ok: false,
                message: "Google authentication failed. Please try again.",
            });
        }
    });

    return router
}