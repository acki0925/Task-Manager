const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
// const speakeasy = require('speakeasy')
// const { response } = require('express')


const userScheme = new mongoose.Schema({
    email :{
        type:String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('enter valid email address')
            }
        }
    },
    password:{
        type:String,
        trim:true,
        minlength: 8,
        required:true,
        /*match: [
            /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]$/,
            'Please use a one special character, one number, one cap letter'
        ]
        /*validate (value){
            if(!value.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)){
                throw new Error('error')
            }
        }*/
        /*validate(value){
            if(!validator.contains(value,/^[0-9a-zA-Z]+$/)){
                throw new Error()
            }
        }*/
        /*validate(value){
            if(!validator.contains(value,seed,{[(value.match(/^[0-9a-zA-Z]+$/) && value.match(/^[@!#\$\^%&*()+=\-\[\]\\\';,\.\/\{\}\|\":<>\? ]+$/)) ]})){
                throw new Error('error provide atleast one special and cap character')
            }
        }*/
        /*validate(value){
            if(!validator.isAlphanumeric(value)){
                throw new Error ('error : provide atleast one number and one cap letter')
            }
        }*/
        /*validate(value){
            if(!validator.matches(value,((/^[0-9a-zA-Z]+$/) && (/^[@!#\$\^%&*()+=\-\[\]\\\';,\.\/\{\}\|\":<>\? ]+$/)))){
                throw new Error('provide special character and cap letter')
            }
        }*/
    },
    role:{
        type: String,
        enum: ['user','manager'],
        default: 'user'
    },
    isVerified:{
        type: Boolean,
        default: false       
    },
    enable2FA:{
        type: Boolean,
        default: false
    },
    secret2FA:{
        type: String,
    
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    loginDevices:{
        type: [String]
    },
    binanceKey: {
        default:{},
        apiKey:{
            type: [String]
        },
        apiSecret:{
            type: String
        }
    },
    resetPasswordToken:{
        type: String,
        required: false
    },
    resetPasswordExpires:{
        type:Date,
        required: false
    },
    tokens:[{
        token:{
            type:String,
            required:true     
        }
    }]

})

userScheme.virtual('projects',{
    ref:'Project',
    localField:'_id',
    foreignField:'u_id'
})

/*userScheme.methods.generateAuthToken = async function(){
    const user = this
    const token = await jwt.sign({_id : user._id.toString()}, 'kirthi')

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}*/

userScheme.methods.generateAuthToken = async function(){
    const user = this
    const token = await jwt.sign({_id : user._id.toString()}, 'kirthi')
    //await user.save()
    console.log(token)
    return token
}

userScheme.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('given valid email')
    }
    const check = await bcrypt.compare(password,user.password)
    if(!check){
        throw new Error('wrong password')
    }
    return user
}  

userScheme.methods.generatePasswordReset = async function() {
    const user = this
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordExpires = Date.now() + 3600000 //expires in an hour
}

userScheme.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

const User = mongoose.model('userDetails',userScheme)

module.exports = User

