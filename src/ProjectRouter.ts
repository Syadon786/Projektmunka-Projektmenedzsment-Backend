import {Router} from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from './User';
import Project from './Project';


const projectRouter = Router();

//create new project
projectRouter.post("/project", (req, res) => {
    console.log(req.body);
    User.find({email : req.body.users}, {_id: 1}, (err, validUsers) => {
        if(err) {
            res.send("Failure");
            return console.log(err);
        }
        const newProject = new Project({
            _id: uuidv4(),
            name: req.body.name,
            owner: req.body.owner,
            treeData: req.body.treeData,
            users: [req.body.owner, ...validUsers.map(act => act.id)]
        });
        newProject.save((err) => {
            if(err) {
                res.send("Failure");
                return console.log(err);
            }
            console.log("A new project was successfully created.");
            res.send("Success");
        });
    })
});

//get projects that the user is in
projectRouter.get("/:userId/project/", (req, res) => {
    Project.find({$or: [{owner : req.params.userId}, {users : req.params.userId}]},  { name: 1 , owner: 1}, (err : Error, result : any) => {
        if(err) {
            res.send(err);
            return console.log(err);
        }
        res.send(result);
    })
})

//get the treeData of a project
projectRouter.get("/project/:projectId", (req, res) => {
    Project.findOne({_id: req.params.projectId}, {treeData: 1, _id: 0}, (err : Error, result: any) => {
        if(err) {
            res.send('Failure');
            return console.log(err);       
           }     
           res.send(result);
    })
});

//update the treeData of a project
projectRouter.patch("/project/:projectId", (req, res) => {
    Project.updateOne({_id: req.params.projectId}, {treeData : req.body.treeData}, (err : Error) => {
       if(err) {
        res.send('Failure');
        return console.log(err);       
       }     
       res.send('Success');
    })
});

//delete a project
projectRouter.delete("/project/:projectId", (req, res) => {
    Project.deleteOne({_id: req.params.projectId}, (err : Error) => {
        if(err) {
            res.send('Failure');
            return console.log(err);       
        }  
        res.send('Success');   
    })
});

export default projectRouter;