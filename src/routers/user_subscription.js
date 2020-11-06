const express = require('express')
const auth = require('../middleware/auth')

const{
    allProductsAndPlans,
    createProduct,
    createPlan,
    signUpProduct,
    payment
}= require('../controllers/user_subscription')

const router = express.Router()

router.post('/signUpProduct',auth,signUpProduct)
router.post('/createPlan',createPlan)
router.post('/createProduct',createProduct)
router.get('/getAllProductsAndPlans',allProductsAndPlans)
router.post('/payment',auth,payment)


module.exports = router