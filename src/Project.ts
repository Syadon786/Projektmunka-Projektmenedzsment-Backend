import {Schema, model} from 'mongoose';

const project = new Schema({
    _id: {
        required: true,
        type: String
    },
    name: {
        required: true,
        type: String
    },
    owner: {
        required: true,
        type: String
    },
    treeData: {
        required: true,
        type: Array<Object>
    },
    users: {
        required: true,
        type: Array<String>
    }
});

export default model("Project", project);