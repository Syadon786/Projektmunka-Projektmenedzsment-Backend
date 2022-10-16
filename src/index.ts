import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
mongoose.connect('mongodb://localhost:27017/projectworkDB', {}, () => {
    console.log("Connected to mongoose successfully!");
});

app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.listen(3001, () => {
    console.log("Server started");
})