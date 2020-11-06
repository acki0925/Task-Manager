const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
require('../db/mongoose')
const User = require('../models/user')
const sendMail = require('../mails/accountMail')
//const auth = require('../middleware/auth')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const sgMail = require('@sendgrid/mail')
const os = require('os')
const STRIPE_API = require('../api/stripe_functions')




exports.register = asyncHandler(async(req,res)=>{
    const user= new User(req.body)
    
    const secret = speakeasy.generateSecret({length:20})
    console.log(secret)
    user.secret2FA = secret.base32
    await user.save()
    sendMail(user.email,user._id)
     //const token = await user.generateAuthToken()
    res.status(201).send({user:user,data:'successfully register .please verify your accout'})
    
})

exports.login =asyncHandler(async(req,res,next)=>{
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const deviceName = os.hostname()
    user.loginDevices.push(deviceName)
    await user.save()
    if(user.isVerified === true){
        //sendTokenResponse(user,200,res);
        const token = await user.generateAuthToken()
        res.cookie('token',token,{maxAge: 1000*60*60 , httpOnly: true}).json({success: true, data: token})

    }
    
})

exports.recover = asyncHandler(async(req,res,next)=>{
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new ErrorResponse(`given email is invalid`,401))
    }
    await user.generatePasswordReset()
    await user.save()
    //send email
    let link =`${req.protocol}://${req.get('host')}${req.originalUrl}`+user.resetPasswordToken

    const mailOptions = {
        to: user.email,
        from: process.env.USER_EMAIL,
        subject: "Password change request",
        text: `Hi ${user.email} \n 
            Please click on the following link ${link} to reset your password. \n\n 
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    sgMail.send(mailOptions,(err,result)=>{
        if(err){
            return res.status(500).json({message: err.message})
        }
        
    })
    res.status(200).json({message:`a reset email has been sent to ${user.email}`})
})

exports.resetPassword = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
    if(!user){
        return next(new ErrorResponse(`password reset token is invalid or expired`,401))
    }
    //set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    // send email
    const mailOptions = {
        to: user.email,
        from: process.env.USER_EMAIL,
        subject: "Your password has been changed",
        text: `Hi ${user.email} \n 
        This is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };

    sgMail.send(mailOptions,(err,result)=>{
        if(err){
            return res.status(500).json({message: err.message})
        }
       
    })
    res.status(200).json({message:`your password has been updated`})
})

exports.conformEmail=asyncHandler(async(req,res,next)=>{
    
    const user = await User.findByIdAndUpdate({ _id: req.params.id }, {isVerified:true}, { new: true })
    if(!user){
        return next(new ErrorResponse('given id invalid',401))
    }
    res.status(200).send({user:user, msg:'verified successfully'})

})

exports.userProfile = asyncHandler(async(req,res,next)=>{
    const user = req.user
    const updates = Object.keys(req.body)
    const validUpdates = ['binanceKey']
    const isValid = updates.every((update)=>validUpdates.includes(update))
    if(!isValid){
        return next(new ErrorResponse(`userProfile update field invalid `, 404))
    }
    user.binanceKey.apiKey.push(req.body.binanceKey.apiKey)
    if(req.body.binanceKey.apiSecret){
        user.binanceKey.apiSecret = req.body.binanceKey.apiSecret
    }
    
    //updates.forEach((update)=> user[update]=req.body[update])
    await user.save()
    res.status(200).send(user) 
})

exports.qrcode =asyncHandler(async(req,res,next)=>{
    const user = req.user
    if(user.enable2FA === true){
                
        qrcode.toDataURL('otpauth://totp/SecretKey?secret='+user.secret2FA,(err,data)=>{
            if(err){
                throw Error(err)
            }
            res.send(data)
            //console.log(data)
        })
    }    
}) 

exports.verify2fa =asyncHandler(async(req,res,next)=>{
    const user = req.user

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

})

exports.removeDevice = asyncHandler(async(req,res,next)=>{
    const user = req.user
    
    //const deviceName =await User.findOne({loginDevices:req.body.deviceName})
    user.loginDevices = user.loginDevices.filter((device)=>{
        return device !== req.body.deviceName
    })
    await user.save()
    res.status(200).json({message:'given deviceName was removed'})
})

exports.logout = asyncHandler(async(req,res,next)=>{

    const deviceName = os.hostname()
    req.user.loginDevices = req.user.loginDevices.filter((device)=>{
        return device !== deviceName
    })
        // req.user.tokens = req.user.tokens.filter((token)=>{
        //     return token.token !== req.token
        // })
    res.clearCookie('token')
    await req.user.save()
    res.status(200).json({message:'logout success', user: req.user})
    
})

exports.logoutAll =asyncHandler(async(req,res,next)=>{
    
    req.user.tokens =[]
    res.clearCookie('token')
    await req.user.save()
    res.send("log out all finished")

})


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // create token
    const token = user.generateAuthToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    // secure the cookie in production mode
    if(process.env.NODE_ENV=== 'production') {
        options.secure = true
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
}
