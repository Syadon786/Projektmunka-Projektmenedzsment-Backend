import {Router} from 'express';
import User from './User';
import Project from './Project';


const usersRouter = Router();

//get all users expect the user that sent the request
usersRouter.post("/users", (req, res) => {
    User.find({ _id: { $ne: req.body.owner }}, { email: 1 , _id: 0}, (err : Error, result : any) => {
        if(err) {
            res.send("Failure");
            return console.log(err);
        }
        res.send(result);
    })     
})

//get all users that are in the project
usersRouter.get("/project/:projectId/users", (req, res) => {
    Project.findById(req.params.projectId, {_id: 0, users: 1}, (err : Error, projectUsers : any) => {
        if(err) {
            res.send('Failure');
            return console.log(err);       
        }
        User.find({_id : projectUsers.users}, (err : Error, users : any) => {
            if(err) {
                res.send('Failure');
                return console.log(err);       
            }
            res.send(users);
        })
    })
});

//remove a user from a project
usersRouter.delete("/project/:projectId/users/:userId", (req, res) => {
     Project.updateOne({_id : req.params.projectId}, 
        {$pull: {users: req.params.userId}}, (err : Error) => {
            if(err) {
                res.send('Failure');
                return console.log(err);       
            }
            res.send("Success");
        })
});

//add a user to a project
usersRouter.put("/project/:projectId/users/", (req, res) => {
    User.find({email: req.body.emails}, {_id: 1}, (err : Error, newUsers : Array<any>) => {
        if(err) {
            res.send('Failure');
            return console.log(err);       
        }
        console.log(newUsers);
        Project.updateOne({_id: req.params.projectId}, {$addToSet: {users: {$each: newUsers.map(act => act._id)}}}, (err : Error) => {
            if(err) {
                res.send('Failure');
                return console.log(err);       
            }
            res.send("Success");
        });
    })
});

export default usersRouter;