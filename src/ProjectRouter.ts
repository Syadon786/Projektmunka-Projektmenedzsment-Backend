import {Router} from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from './User';
import Project from './Project';
import Conversation from './Conversation';
import Task from './Task';
import Permissions from './Permissions';
import cloudinary from './Cloudinary';
import Message from './Message';


const projectRouter = Router();

//create new project
projectRouter.post("/project", async (req, res) => {
    try {
        console.log(req.body);
        const validUsers = await User.find({email : req.body.users}, {_id: 1});      
        const conversationId = uuidv4();
        const projectId = uuidv4();
        const newProject = new Project({
            _id: projectId,
            name: req.body.name,
            owner: req.body.owner,
            treeData: req.body.treeData,
            users: [req.body.owner, ...validUsers.map(act => act.id)],
            conversations: [conversationId]
        });

        await newProject.save()
        console.log("A new project was successfully created.");
        const newConversation = new Conversation({
            _id: conversationId,
            title: req.body.name,
            members: [req.body.owner, ...validUsers.map(act => act.id)]
        })

        const newPermission = new Permissions({
            _id: uuidv4(),
            projectId: projectId,
        })

        await newPermission.save();
            
        await newConversation.save()
        console.log("A new conversation was successfully created.");
        res.send("Success");         
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
});

//get projects that the user is in
projectRouter.get("/:userId/project/", async (req, res) => {
    try {
        const result = await Project.find({$or: [{owner : req.params.userId}, {users : req.params.userId}]},  { name: 1 , owner: 1});
        res.send(result);
    }
    catch(e) {
        console.log(e);
        res.send(e);
    }
})

//get the treeData of a project
projectRouter.get("/project/:projectId", async (req, res) => {
    try {
        const result = await Project.findOne({_id: req.params.projectId}, {treeData: 1, _id: 0})
        res.send(result);
    }
    catch(e) {
        console.log(e);
        res.send('Failure');
    }
});

//update the treeData of a project
projectRouter.patch("/project/:projectId", async (req, res) => {
    try {
        await Project.updateOne({_id: req.params.projectId}, {treeData : req.body.treeData});
        res.send('Success');
    }
    catch(e) {
        console.log(e);
        res.send('Failure');
    }
   
});

//delete a project
projectRouter.delete("/project/:projectId", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.projectId);
        const conversationIds = await Task.find({projectId: req.params.projectId}, {conversationId: 1, _id: 0});
        console.log(conversationIds);
        await Conversation.deleteMany({_id: [...conversationIds.map(conv => conv.conversationId), ...project.conversations]});
        await Message.deleteMany({conversationId: [...project.conversations, ...conversationIds.flatMap(obj => obj.conversationId)]})
        await Permissions.deleteOne({projectId: project._id})
        await Task.deleteMany({projectId: req.params.projectId});

        const tasksImages = await Task.find({projectId: req.params.projectId}, {_id: 0, images: 1});
        const imageUrls = tasksImages.flatMap(obj => obj.images);
        if(imageUrls.length > 0) {
            await cloudinary.api.delete_resources(imageUrls.map(url => url.substring(61).split('.')[0]))
        }
        res.send('Success');          
    }
    catch(e) {
        console.log(e);
        res.send('Failure');
    }
});

export default projectRouter;