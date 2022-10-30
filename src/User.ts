import mongoose from 'mongoose';

const user = new mongoose.Schema({
    googleId: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String
    },
    name: {
        required: true,
        type: String
    },
    photo: {
        required: true,
        type: String
    }
});

export default mongoose.model("User", user);