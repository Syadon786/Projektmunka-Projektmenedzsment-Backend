import {Router} from 'express';
import Message from './Message';
import User from './User';

const messageRouter = Router();

messageRouter.post("/messages", async (req, res) => {
    try {
        const newMessage = new Message({
            _id: req.body._id,
            conversationId: req.body.conversationId,
            sender: req.body.sender,
            text: req.body.text
        })
       await newMessage.save();

       res.send(newMessage);
    }
    catch(e) {
        console.log(e);
        res.send('Failure');
    }
   
 
})

messageRouter.get("/messages/:conversationId", async (req, res) => {
    try {
        res.send(await Message.find({conversationId: req.params.conversationId}));
    }
    catch(e) {
        console.log(e);   
        res.send('Failure');
    }
})

messageRouter.get("/messages/:senderId/photo", async (req, res) => {
    try {
        res.send(await User.findOne({_id: req.params.senderId}, {_id: 0, photo: 1}));
    }
    catch(e) {
        console.log(e);   
        res.send('Failure');
    }
})

export default messageRouter;