
const express = require('express')
const auth = require('../middleware/auth')
const{
    createProject,
    getAllProject,
    getOneProject,
    editProject,
    deleteProjectAndTask
}= require('../controllers/project')

const router = express.Router()

router.post('/createProject', auth, createProject)
router.get('/getAllProject', auth, getAllProject)
router.get('/project/:id',auth,getOneProject)
router.patch('/editProject/:id',auth,editProject)
router.delete('/deleteProjectAndTask/:id',auth, deleteProjectAndTask)


module.exports = router