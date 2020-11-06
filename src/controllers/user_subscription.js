const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
require('../db/mongoose')


const STRIPE_API = require('../api/stripe_functions')


exports.allProductsAndPlans = asyncHandler(async(req,res,next)=>{
    const product = await STRIPE_API.getAllProductsAndPlans()
    res.send(product)
})

exports.createProduct = asyncHandler(async(req,res,next)=>{
    const newProduct = await STRIPE_API.createProduct(req.body)
    res.send(newProduct)
})

exports.createPlan = asyncHandler(async(req,res,next)=>{
    const newPlan = await STRIPE_API.createPlan(req.body)
    res.send(newPlan)
})

exports.signUpProduct = asyncHandler(async(req,res,next)=>{
    var product = {
        name: req.body.productName
    };
    
    var plan = {
        id: req.body.planId,
        name: req.body.planName,
        amount: req.body.planAmount,
        interval: req.body.planInterval,
        interval_count: req.body.planIntervalCount
    }

    res.send(product,plan)
})

exports.payment = asyncHandler(async(req,res,next)=>{
    var product = {
        name: req.body.productName
    };
    
    var plan = {
        id: req.body.planId,
        name: req.body.planName,
        amount: req.body.planAmount,
        interval: req.body.planInterval,
        interval_count: req.body.planIntervalCount
    }
    
    const customer = await STRIPE_API.createCustomerAndSubscription(req.body)
    res.send(customer,plan,product)    
})

