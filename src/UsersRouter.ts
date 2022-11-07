import {Router} from 'express';
import User from './User';
import Project from './Project';
import Conversation from './Conversation';

const usersRouter = Router();

//get all users expect the user that sent the request
usersRouter.post("/users", async (req, res) => {
    try {
        const result = await User.find({ _id: { $ne: req.body.owner }}, { email: 1 , _id: 0});
        res.send(result);
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }   
})

//get all users that are in the project
usersRouter.get("/project/:projectId/users", async (req, res) => {
    try {
       const projectUsers = await Project.findById(req.params.projectId, {_id: 0, users: 1});
       const users = await User.find({_id : projectUsers.users});   
       res.send(users);
    }
    catch(e) {
        console.log(e);
        res.send('Failure');
    }
});

//remove a user from a project
usersRouter.delete("/project/:projectId/users/:userId", async (req, res) => {
    try {
        const conversations = await Project.find({_id: req.params.projectId}, {_id : 0, conversations: 1});
        console.log(conversations[0].conversations);
        await Conversation.updateMany({_id: { $in: conversations[0].conversations}}, {$pull: {members: req.params.userId}});
        await Project.updateOne({_id : req.params.projectId}, {$pull: {users: req.params.userId}})
        res.send('Success');
    }
    catch(e) {
        console.log(e);
        res.send('Failure');
    }
    
});

//add a user to a project
usersRouter.put("/project/:projectId/users/", async (req, res) => {
    try {
        const newUsers = await User.find({email: req.body.emails}, {_id: 1});
        console.log(newUsers);
        const conversations = await Project.find({_id: req.params.projectId}, {_id : 0, conversations: 1});
        await Conversation.updateMany({_id: { $in: conversations[0].conversations}}, {$addToSet: {members: {$each: newUsers.map(act => act._id)}}});   
        await Project.updateOne({_id: req.params.projectId}, {$addToSet: {users: {$each: newUsers.map(act => act._id)}}})
        res.send("Success");
    }
    catch(e) {
        console.log(e);
        res.send('Failure');
    }
});

export default usersRouter;