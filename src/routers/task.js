
const express = require('express')
const auth = require('../middleware/auth')
const{
    createTask,
    getAllTask,
    getOneTask,
    editTask,
    deleteTask
}= require('../controllers/task')

const router = express.Router()

router.post('/createTask',auth,createTask)
router.get('/getAllTask/:id', auth, getAllTask)
router.get('/task/:id', auth, getOneTask)
router.patch('/editTask/:id', auth, editTask)
router.delete('/deleteTask/:id',auth,deleteTask)

module.exports = router