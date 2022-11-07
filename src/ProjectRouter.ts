import {Router} from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from './User';
import Project from './Project';
import Conversation from './Conversation';


const projectRouter = Router();

//create new project
projectRouter.post("/project", async (req, res) => {
    try {
        console.log(req.body);
        const validUsers = await User.find({email : req.body.users}, {_id: 1});      
        const conversationId = uuidv4();

        const newProject = new Project({
            _id: uuidv4(),
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
            members: [req.body.owner, ...validUsers.map(act => act.id)]
        })
            
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
        const conversations = await Project.find({_id: req.params.projectId}, {_id : 0, conversations: 1});
        await Conversation.deleteMany({_id: { $in: conversations[0].conversations}});
        await Project.deleteOne({_id: req.params.projectId})
        res.send('Success');          
    }
    catch(e) {
        console.log(e);
        res.send('Failure');
    }
});


// const findItemNested = (arr : Array<any>, taskId : String) : Array<any> => (
//     arr.reduce((a, task) => {
//       if (a) return a;
//       if (task.taskId === taskId) return task;
//       if (task["children"]) return findItemNested(task["children"], taskId)
//     }, null)
//   );

export default projectRouter;