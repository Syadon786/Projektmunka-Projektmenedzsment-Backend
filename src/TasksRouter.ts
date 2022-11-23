import {Router} from 'express';
import Task from './Task';
import Conversation from './Conversation';
import Project from './Project';
import User from './User';
import { v4 as uuidv4 } from 'uuid';

const tasksRouter = Router();

//create new task
tasksRouter.post("/task", async (req, res) => {
    try {
        const conversationId = uuidv4();
        const validUsers = await User.find({email : req.body.members}, {_id: 1});   
        const validProjectUsers = await Project.find({_id: req.body.projectId}, {users: 1, _id: 0});
        const filteredUsers = validProjectUsers[0].users.filter(id => validUsers.map(user => user._id).includes(id));
       
        const newTask = new Task({
            _id: req.body._id,
            title: req.body.title,
            projectId: req.body.projectId,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            description: req.body.description,
            conversationId: conversationId,
            members: [...filteredUsers]
        });

        await newTask.save()
        console.log("A new task was successfully created."); 

        const newConversation = new Conversation({
            _id: conversationId,
            title: req.body.title,
            members: [...filteredUsers],
            isTaskChat: true
        })
        await newConversation.save();

        res.send("Success");         
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }  
})

tasksRouter.delete("/task/:taskId", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        await Conversation.deleteOne({_id: task.conversationId});
        res.send("Success");         
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
});

tasksRouter.get("/:projectId/task/", async (req, res) => {
    try {
        const tasks = await Task.find({projectId: req.params.projectId});
        res.send(tasks);
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
});


tasksRouter.get("/task/:taskId/members/", async (req, res) => {
    try {
         const userIds = await Task.findById(req.params.taskId, {members: 1, _id: 0});
         const users = await User.find({_id: userIds.members});
         res.send(users);
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
})

tasksRouter.patch("/task/:taskId", async (req, res) => {
    try {
        const validUsers = await User.find({email : req.body.members}, {_id: 1});   
        const validProjectUsers = await Project.find({_id: req.body.projectId}, {users: 1, _id: 0});
        const filteredUsers = validProjectUsers[0].users.filter(id => validUsers.map(user => user._id).includes(id));
        
        const task = await Task.findByIdAndUpdate({_id: req.params.taskId}, {title: req.body.title, endDate: req.body.endDate,
        description: req.body.description, subtasks: req.body.subtasks, $addToSet: {members: {$each: filteredUsers}}
        })

        await Conversation.updateOne({_id: task.conversationId}, {title: req.body.title, $addToSet: {members: {$each: filteredUsers}}})
        res.send("Success");
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
})

export default tasksRouter;