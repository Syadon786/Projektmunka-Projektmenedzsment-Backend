import {Router} from 'express';
import Permissions from './Permissions';


const permissionRouter = Router();

permissionRouter.get("/permissions/:projectId", async (req, res) => {
    try {
        const permObj = await Permissions.findOne({projectId: req.params.projectId}, {_id: 0, permissions: 1})
        console.log(permObj.permissions);
        res.send(permObj.permissions);
    }
    catch(e) {
        console.log(e);
        res.send("Failure");
    }
})

permissionRouter.post("/permissions/:projectId", async (req, res) => {
    try {
        const permObj = await Permissions.findOne({projectId: req.params.projectId}, {_id: 0, permissions: 1});
        const newPermObj = {...permObj.permissions};
        for(let key in req.body.permToUpdate) {
            if(!(key in newPermObj[req.body.taskId])) {
                newPermObj[req.body.taskId][key] = {}
            }
            newPermObj[req.body.taskId][key] = req.body.permToUpdate[key];
        }
        console.log(newPermObj);
        await Permissions.updateOne({projectId: req.params.projectId}, {permissions: newPermObj});
        res.send("Success");
        
    } catch(e) {
        console.log(e);
        res.send("Failure");
    }
})

export default permissionRouter;