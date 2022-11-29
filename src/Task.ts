import {Schema, model} from 'mongoose';

const task = new Schema({
    _id: {
        required: true,
        type: String
    },
    projectId: {
        required: true,
        type: String
    },
    conversationId: {
        required: true,
        type: String
    },
    title: {
        required: true,
        type: String
    },
    startDate: {
        required: true,
        type: String
    },
    endDate: {
        required: true,
        type: String
    },
    description: {
        type: String
    },
    subtasks: {
        type: Array<String>
    },
    completedTasks: {
        type: Array<Boolean>
    },
    members: {
        type: Array<String>
    },
    images: {
        type: Array<String>
    }
});

export default model("Task", task);