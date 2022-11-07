import {Schema, model} from 'mongoose';

const message = new Schema({
    _id: {
        type: String,
        required: true
    },
    conversationId: {
        type: String
    },
    sender: {
        type: String
    },
    text: {
        type: String
    }
},
{timestamps: true}
);

export default model("Message", message)