import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();

const app = express();
mongoose.connect(`${process.env.DATABASE_URL}${process.env.DATABASE_NAME}`, {}, () => {
    console.log("Connected to mongoose successfully!");
});

//Middleware
app.use(express.json());
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user : any, done : any) => {
    return done(null, user);
});

passport.deserializeUser((user : any, done : any) => {
    return done(null, user);
})

passport.use(new GoogleStrategy({
    clientID: "375844977945-8bk8b2svnct67cpogemkpv42ktbbo2r3.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/auth/google/callback"
},
    function(accessToken: any, refreshToken: any, profile: any, callback: any) {
        //Called on successful auth 
        //insert into database
        console.log(profile);
        callback(null, profile)
    }
));

app.get('/auth/google',
    passport.authenticate('google', {scope : ['profile', 'https://www.googleapis.com/auth/userinfo.email']}
));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect : '/login'}),
    function(req, res) {
        //Successful auth, redirect HomePage
        res.redirect('http://localhost:3000');
    }
);

app.get("/getuser", (req, res) => {
    res.send(req.user);
});

app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.listen(3001, () => {
    console.log("Server started");
})