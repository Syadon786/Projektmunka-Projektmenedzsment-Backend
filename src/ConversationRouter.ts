import {Router} from 'express';
import Conversation from './Conversation';
import User from './User';
import Project from './Project';
import Task from './Task';
import { v4 as uuidv4 } from 'uuid';

const conversationRouter = Router();


//get project conversations 
conversationRouter.get("/conversations/:projectId", async (req, res) => {
    try {
        const conversationIds = await Project.find({_id: req.params.projectId}, {_id : 0, conversations: 1});
        const taskConversationIds = await Task.find({projectId: req.params.projectId}, {_id: 0, conversationId: 1});
        const conversations = await Conversation.find({_id: { $in: [...conversationIds[0].conversations, ...taskConversationIds.map(task => task.conversationId)]}});
        res.send(conversations);
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
})

//get users by id for conversations
conversationRouter.post("/conversations/users", (req, res) => {
    User.find({_id: req.body.userIds}, (err : Error, users : any) => {
        if(err) {
            res.send("Failure");
            return console.log(err);
        }
        res.send(users);
    })
})



export default conversationRouter;