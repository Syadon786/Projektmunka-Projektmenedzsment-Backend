import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

import User from './User';

import projectRouter from './ProjectRouter';
import usersRouter from './UsersRouter';
import messageRouter from './MessageRouter';
import conversationRouter from './ConversationRouter';
import tasksRouter from './TasksRouter';

const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();

const app = express();
mongoose.connect(`${process.env.DATABASE_URL}`, {}, () => {
    console.log("Connected to mongoose successfully!");
});

//Middleware
app.use(express.json());
app.use(cors({origin: `${process.env.FRONTEND}`, credentials: true}));

app.set("trust proxy", 1);
app.use(session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
    cookie: {
        // sameSite: "none",
        // secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 //One week
    }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((googleId : any, done : any) => {
    return done(null, googleId);
});

passport.deserializeUser((googleId : any, done : any) => {
    User.findById(googleId, (err : Error, user : any) => {
        if(err) return done(null, null);
        return done(null, user);
    })
})

passport.use(new GoogleStrategy({
    clientID: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    callbackURL: "/auth/google/callback"
},
    function(accessToken: any, refreshToken: any, profile: any, callback: any) {
        User.findById(profile.id, async (err: Error, user: any) => {
            if(err) return callback(err, null);
            if(!user) { //then create
                const newUser = new User({
                    _id: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    photo: profile.photos[0].value
                });
                await newUser.save();
                callback(null, newUser._id);
            }   
            callback(null, user._id);       
        })
    }
));

app.get('/auth/google',
    passport.authenticate('google', {scope : ['profile', 'https://www.googleapis.com/auth/userinfo.email']}
));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect : '/login'}),
    function(req, res) {
        //Successful auth, redirect HomePage
        res.redirect(process.env.FRONTEND);
    }
);

app.get("/auth/logout", (req, res) => {
    if(req.user) {
        req.logOut(() => { 
            req.session.destroy(() => {
                res.clearCookie('connect.sid');
                res.send("success");
            });
        });      
    }
})

app.get("/getuser", (req, res) => {
    res.send(req.user);
});

//! Routers
app.use(projectRouter);
app.use(usersRouter);
app.use(conversationRouter);
app.use(messageRouter);
app.use(tasksRouter);

app.get("/", (req, res) => {
    res.send("Server is alive!");
})

app.listen(process.env.PORT || 3001, () => {
    console.log("Server started");
})