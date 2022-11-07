import {Schema, model} from 'mongoose';

const conversation = new Schema({
    _id : {
        type: String,
        required: true
    },
    members: {
        type: Array,
    }
},
{timestamps: true}
);

export default model("Conversation", conversation)