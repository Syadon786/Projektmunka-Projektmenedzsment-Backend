import {Schema, model} from 'mongoose';

const user = new Schema({
    _id: {
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

export default model("User", user);