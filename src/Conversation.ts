import {Schema, model} from 'mongoose';

const conversation = new Schema({
    _id : {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    members: {
        type: Array,
    },
    isTaskChat: {
        type: Boolean
    }
},
{timestamps: true}
);

export default model("Conversation", conversation)