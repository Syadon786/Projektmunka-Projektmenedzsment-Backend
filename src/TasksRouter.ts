import {Router} from 'express';
import Task from './Task';
import Conversation from './Conversation';
import Project from './Project';
import User from './User';
import cloudinary from './Cloudinary';
import { v4 as uuidv4 } from 'uuid';
import Permissions from './Permissions';
import Message from './Message';

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

        const permObj = await Permissions.findOne({projectId: req.body.projectId}, {_id: 0, permissions: 1});
        const newPermObj = permObj.permissions;
        newPermObj[`${req.body._id}`] = {};
        await Permissions.updateOne({projectId: req.body.projectId}, {permissions: newPermObj});

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
        await Message.deleteMany({conversationId: task.conversationId});
        const permObj = await Permissions.findOne({projectId: task.projectId}, {_id: 0, permissions: 1});
        const newPermObj = permObj.permissions;
        delete newPermObj[`${task._id}`]
        await Permissions.updateOne({projectId: task.projectId}, {permissions: newPermObj});
        await cloudinary.api.delete_resources(task.images.map(url => url.substring(61).split('.')[0]))

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

tasksRouter.post("/task/image/upload", async (req, res) => {
    try {
        const response = await cloudinary.uploader.upload(req.body.image, {
            upload_preset: `${process.env.CLOUDINARY_UPLOAD_PRESET}`,
        })
        if(response) {
            console.log(response);
            await Task.updateOne({_id: req.body.taskId},  { $push: { images: response.url} })
            res.send("Success");
        }
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
})

tasksRouter.get("/task/:taskId/images", async (req, res) => {
    try {
        const images = await Task.findOne({_id: req.params.taskId}, {images: 1, _id: 0});
        if(images) {
            res.send(images);
        }
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
})

tasksRouter.delete("/task/:taskId/image", async (req, res) => {
    try {
      
        await Task.updateOne({_id: req.params.taskId}, 
            {$pull: {images: req.body.url}})
        const response = await cloudinary.uploader.destroy(req.body.assetName);
        if(response.result === "ok") {
            res.send("Success");
        }
    } catch(e) {
        console.log(e);
        res.send("Failure");
    }
})


export default tasksRouter;