const mongoose = require('mongoose')
const validator = require ('validator')


const projectScheme = new mongoose.Schema({
    name :{
        type : String,
        required : true,
        trim : true
    },
    description :{
        type: String,
        required:[true, 'Please add a description'],
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },
    u_id:{
        type: mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'User'
    }
})

projectScheme.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'p_id'
})

const Project = mongoose.model('Project', projectScheme)


module.exports = Project