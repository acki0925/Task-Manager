const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const User = require('../models/user')


// const secret = speakeasy.generateSecret({length:20})
// console.log(secret)

function generateToken(secret){
    //if(User.enable2FA === true){

   
    let token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
    })
    console.log(token)
    return (token)
  //  }
}

function qrgenerate(secret){
    qrcode.toDataURL('otpauth://totp/SecretKey?secret='+secret.base32,(err,data)=>{
        if(err){
            throw Error(err)
        }
        console.log(data)
    })
}

function verifyOTP(secret, token){
    let isverified = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token: token 
    })
    console.log(isverified)
    console.log(isverified+'dkjanfj')
}  

//var token = generateToken(secret)
//qrgenerate(secret.base32)
//verifyOTP(secret,token)
module.exports={
    generateToken,
    verifyOTP
}

/*
const express = require('express')
require('../db/mongoose')
const User = require('../models/user')
const sendMail = require('../mails/accountMail')
const auth = require('../middleware/auth')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
//const {verifyOTP} = require('../module/2fa')

const router = express.Router()

router.post('/signUp',async(req,res)=>{
    const user= new User(req.body)
    try {
        const secret = speakeasy.generateSecret({length:20})
        console.log(secret)
        user.secret2FA = secret.base32
        await user.save()
        sendMail(user.email,user._id)
        //const token = await user.generateAuthToken()
        res.status(201).send({user:user,data:'successfully register .please verify your accout'})
    } catch (error) {
        res.status(400).send({error:'please signUP'})
    }
})

router.patch('/confirmEmail/:id',async(req,res)=>{
    try {
        const user = await User.findByIdAndUpdate({ _id: req.params.id }, {isVerified:true}, { new: true })
        res.status(200).send({user:user, msg:'verified successfully'})

    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/login',async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        if(user.isVerified === true){
            const token = await user.generateAuthToken()
            console.log(token)
            // if(user.enable2FA === true){     
            //     let otp = speakeasy.totp({
            //         secret: user.secret2FA,
            //         encoding: 'base32'
            //     })
            //     res.send({otp,user,token})
            // }
            res.cookie('token',token,{maxAge: 1000*60*60,httpOnly: true,secure:false})
            res.send({user,token,}) 
        }else{
            res.status(401).send('confirm and verify your mail')
        }
        
    } catch (error) {
        res.status(500).send({error:'please login'})
    }  
})
router.get('/QRcode',auth, async(req,res)=>{
    const user = req.user
    if(req.user.enable2FA === true){
                
        qrcode.toDataURL('otpauth://totp/SecretKey?secret='+user.secret2FA,(err,data)=>{
            if(err){
                throw Error(err)
            }
            res.send(data)
            //console.log(data)
        })
    }    
}) 

router.post('/login/verify',auth, async(req,res)=>{
    const user = req.user
    try {
        console.log(user.secret2FA)
        var result = speakeasy.totp.verify({
            secret: user.secret2FA,
            encoding: 'base32',
            token: req.body.otp 
        })
        console.log(result)
        if(result === true){
            return res.send('verified successfully')
        }else{
            return res.send('opt wrong')
        }
        
    } catch (error) {
        res.status(500).send({error:'verified unsuccessfull'})
    }
})

router.get('/getuser',auth, (req, res)=>{ 
    //shows all the cookies 
    res.send(req.cookies); 
}) 

router.post('/logout',auth,async(req,res)=>{
    try {
        // req.user.tokens = req.user.tokens.filter((token)=>{
        //     return token.token !== req.token
        // })
        res.clearCookie('token')
        await req.user.save()
        res.send('logout success')
    } catch (error) {
        res.status(500).send({error:'logout unsuccessful '})
    }
})

router.post('/logoutAll',auth,async(req,res)=>{
    try {
        req.user.tokens =[]
        res.clearCookie('jwt')
        await req.user.save()
        res.send("log out all finished")
    } catch (error) {
        res.status(500).send({error:'log out all unsuccessful'})
    }
})
*/


/*
const express = require('express')
require('../db/mongoose')
const Project = require('../models/project')
const auth = require('../middleware/auth')
const Task = require('../models/task')

const router = express.Router()

router.post('/createProject', auth, async(req,res)=>{
    if(req.user.role === 'manager'){
        const project = new Project({
            ...req.body,
            u_id:req.user._id
        })
        try {
            await project.save()
            res.status(201).send({project})
        } catch (error) {
            res.status(400).send({error:'project not created'})
        }
    }else{
        res.send('this function only for manager role')
    }
    
})

router.get('/getAllProject',auth ,async(req,res)=>{
    if(req.user.role === 'manager'){
        try {
            //const project = await Project.find({owner:req.user._id})
            await req.user.populate('projects').execPopulate()
            res.status(200).send(req.user.projects)
        } catch (error) {
            res.status(500).send({error:'invalid user'})
        } 
    }else{
        res.send('this function access only for manager')
    }
})

router.get('/project/:id',auth,async(req,res)=>{
    
    //const _id = new ObjectId(req.params.id)
    if(req.user.role === 'manager'){
        try {
            const project = await Project.findOne({_id:req.params.id, u_id:req.user._id})
            if(!project){
                return res.status(404).send({error:'given id not contains any project'})
            }
            res.send(project)
        } catch (error) {
            res.status(500).send({error:'not get given user details'})        
        }
    }else{
        res.send('this function access only for manager')
    }
    
})

router.patch('/editProject/:id',auth, async(req,res)=>{
    if(req.user.role === 'manager'){
        const updates = Object.keys(req.body)
        const validUpdates = ['name','description']
        const isValid = updates.every((update)=>validUpdates.includes(update))
        if(!isValid){
            return res.status(400).send('invalid account')
        }
    
        try {
            const project = await Project.findOne({_id:req.params.id, u_id:req.user._id})
            // const user = await User.findById(req.params.id)
            // if(!user){
            //     return res.status(404).send("user naahe hey")
            // }
            updates.forEach((update)=> project[update] = req.body[update])
            await project.save()
            res.send(project)
        } catch (error) {
            res.status(500).send({error:'update invalid'})
        }
    }else{
        res.send("this fuction only for manager access")
    }

})

// router.delete('/deleteProject/:id',auth, async(req,res)=>{
//     try {
//         const project = await Project.findOne({_id:req.params.id, u_id:req.user._id})
//         if(!project){
//             return res.status(404).send('project does not exist')
//         }
//         await project.remove()
//         res.send({project:'deleted successful'})
//     } catch (error) {
//         res.status(500).send({error:'delete unsuccessful'})
//     }
// })

router.delete('/deleteProjectAndTask/:id',auth, async(req,res)=>{
    if(req.user.role === 'manager'){
        try {

            const project = await Project.findOne({_id:req.params.id, u_id:req.user._id})
            if(!project){
                return res.status(404).send('project does not exist')
            }
            const task = await Task.find({p_id:req.params.id})
            // await task.every((t)=>t.remove)
            await task.every((t)=>t.remove())
            await project.remove()
            res.send('project and its tasks are deleted successfully')
        } catch (error) {
            res.status(500).send({error:'deleted un successful'})
        }
    }else{
        res.send('delet a project is only access by manager role')
    }
    
})
*/


/*
const express = require('express')
require('../db/mongoose')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const Project = require('../models/project')

const router = express.Router()


router.post('/createTask', auth, async(req,res)=>{
    const task = new Task(req.body)
    try {
        await task.save()
        res.status(201).send({task})
    } catch (error) {
        res.status(400).send({error:'task not created'})
    }
})

// router.get('/getAllTask',auth ,async(req,res)=>{
//     try {
//         console.log('inside try')
//         //const task = await Task.find({t_id:req.user._id})
//         const task = await Project.populate('tasks').execPopulate()
//         console.log(task)
//         res.status(200).send(task)
//     } catch (error) {
//         res.status(500).send({error:'invalid user'})
//     }
// })

router.get('/getAllTask/:id',auth, async(req,res)=>{
    try {
        const task = await Task.find({p_id:req.params.id})
        if(!task){
            return res.status(404).send('empty task')
        }
        res.send(task)
    } catch (error) {
        res.status(500).send({error:'catch block run'})
    }
})

router.get('/task/:id',auth,async(req,res)=>{
    
    //const _id = new ObjectId(req.params.id)
    try {
        const task = await Task.findOne({_id:req.params.id, p_id:req.body.p_id})
        if(!task){
            return res.status(404).send({error:'given id not contains any task'})
        }
        res.send(task)
    } catch (error) {
        res.status(500).send({error:'not get given user details'})        
    }
})

router.patch('/editTask/:id',auth, async(req,res)=>{
    const updates = Object.keys(req.body)
    const validUpdates = ['name','description','p_id']
    const isValid = updates.every((update)=>validUpdates.includes(update))
    if(!isValid){
        return res.status(400).send('invalid account')
    }

    try {
        const task = await Task.findOne({_id:req.params.id})
        // const user = await User.findById(req.params.id)
        // if(!user){
        //     return res.status(404).send("user naahe hey")
        // }
        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(500).send({error:'update invalid'})
    }

})

router.delete('/deleteTask/:id',auth, async(req,res)=>{
    try {
        const task = await Task.findOne({_id:req.params.id, p_id:req.body.p_id})
        if(!task){
            return res.status(404).send('project does not exist')
        }
        await task.remove()
        res.send({task:'deleted successful'})
    } catch (error) {
        res.status(500).send({error:'delete unsuccessful'})
    }
})*/