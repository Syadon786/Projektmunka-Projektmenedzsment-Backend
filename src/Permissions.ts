import {Schema, model} from 'mongoose';

const permission = new Schema({
    _id: {
        required: true,
        type: String
    },
    projectId: {
        required: true,
        type: String
    },
    permissions: {
        required: true,
        type: Object,
        default: {},    
    }
}, {minimize: false});

export default model("Permission", permission);