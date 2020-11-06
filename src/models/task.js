const mongoose = require('mongoose')
const validator = require('validator')


const Task = mongoose.model('Task',{
    name :{
        type : String,
        required : true,
        trim : true
    },
    description :{
        type: String,
        required:[true, 'Please add a description'],
    },
    /*status:{
        type: String,
        default: 'not completed'
    },*/
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },
    p_id:{
        type: mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'Project'
    }
})


module.exports = Task