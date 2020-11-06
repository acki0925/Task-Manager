const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
require('../db/mongoose')
const Project = require('../models/project')

const Task = require('../models/task')


exports.createProject = asyncHandler(async(req,res,next)=>{
    if(req.user.role === 'manager'){
        const project = new Project({
            ...req.body,
            u_id:req.user._id
        })
        
        await project.save()
        res.status(201).send({project})
        
    }else{
        res.send('this function only for manager role')
    }
    
})

exports.getAllProject =asyncHandler(async(req,res,next)=>{
    if(req.user.role === 'manager'){
    
        //const project = await Project.find({owner:req.user._id})
        await req.user.populate('projects').execPopulate()
        res.status(200).send(req.user.projects)
        
    }else{
        res.send('this function access only for manager')
    }
})

exports.getOneProject=asyncHandler(async(req,res,next)=>{
    
    //const _id = new ObjectId(req.params.id)
    if(req.user.role === 'manager'){
        const project = await Project.findOne({_id:req.params.id, u_id:req.user._id})
        if(!project){
            return next(new ErrorResponse(`project not found with id of ${req.params.id}`, 404))
        }
        res.send(project)
        
    }else{
        res.send('this function access only for manager')
    }
    
})

exports.editProject = asyncHandler (async(req,res,next)=>{
    if(req.user.role === 'manager'){
        const updates = Object.keys(req.body)
        const validUpdates = ['name','description']
        const isValid = updates.every((update)=>validUpdates.includes(update))
        if(!isValid){
            return next(new ErrorResponse(`invalid update req with id of ${req.params.id}`, 404))
        }
    
        
        const project = await Project.findOne({_id:req.params.id, u_id:req.user._id})
        if(!project){
            return next(new ErrorResponse(`project not found with id of ${req.params.id}`, 404))
        }
            /*const user = await User.findById(req.params.id)
            if(!user){
                return res.status(404).send("user naahe hey")
            }*/
        updates.forEach((update)=> project[update] = req.body[update])
        await project.save()
        res.send(project)
        
    }else{
        res.send("this fuction only for manager access")
    }

})

exports.deleteProjectAndTask = asyncHandler(async(req,res,next)=>{
    if(req.user.role === 'manager'){
        

        const project = await Project.findOne({_id:req.params.id, u_id:req.user._id})
        if(!project){
            return next(new ErrorResponse(`project not found with id of ${req.params.id}`, 404))
        }
        const task = await Task.find({p_id:req.params.id})
           
        await task.every((t)=>t.remove())
        await project.remove()
        res.send('project and its tasks are deleted successfully')
        
    }else{
        res.send('delet a project is only access by manager role')
    }
    
})