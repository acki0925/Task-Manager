const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
require('../db/mongoose')
const Task = require('../models/task')

const Project = require('../models/project')


exports.createTask = asyncHandler (async(req,res,next)=>{
    const task = new Task(req.body)
    
    await task.save()
    res.status(201).send({task})
    
})

exports.getAllTask = asyncHandler(async(req,res,next)=>{

    const task = await Task.find({p_id:req.params.id})
    if(!task){
        return next(new ErrorResponse(`task not found with id of ${req.params.id}`, 404))
    }
    res.send(task)
})

exports.getOneTask = asyncHandler(async(req,res,next)=>{
    
    //const _id = new ObjectId(req.params.id)
    
    const task = await Task.findOne({_id:req.params.id, p_id:req.body.p_id})
    if(!task){
        return next(new ErrorResponse(`task not found with id of ${req.params.id}`, 404))
    }
    res.send(task)
    
})

exports.editTask =asyncHandler(async(req,res,next)=>{
    const updates = Object.keys(req.body)
    const validUpdates = ['name','description','p_id']
    const isValid = updates.every((update)=>validUpdates.includes(update))
    if(!isValid){
        return res.status(400).send('invalid account')
    }


    const task = await Task.findOne({_id:req.params.id})
    if(!task){
        return next(new ErrorResponse(`task not found with id of ${req.params.id}`, 404))
    }
       
    updates.forEach((update)=> task[update] = req.body[update])
    await task.save()
    res.send(task)
    

})

exports.deleteTask =asyncHandler(async(req,res,next)=>{
    
    const task = await Task.findOne({_id:req.params.id, p_id:req.body.p_id})
    if(!task){
        return next(new ErrorResponse(`task not found with id of ${req.params.id}`, 404))
    }
    await task.remove()
    res.send({task:'deleted successful'})
    
})