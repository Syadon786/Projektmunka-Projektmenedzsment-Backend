import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import User from './User';

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

passport.serializeUser((googleId : any, done : any) => {
    return done(null, googleId);
});

passport.deserializeUser((googleId : any, done : any) => {
    User.findOne({googleId : googleId}, (err : Error, user : any) => {
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
        User.findOne({googleId: profile.id}, async (err: Error, user: any) => {
            if(err) return callback(err, null);
            if(!user) { //then create
                const newUser = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    photo: profile.photos[0].value
                });
                await newUser.save();
                callback(null, newUser.googleId);
            }   
            callback(null, user.googleId);       
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
        res.redirect('http://localhost:3000');
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


app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.listen(3001, () => {
    console.log("Server started");
})