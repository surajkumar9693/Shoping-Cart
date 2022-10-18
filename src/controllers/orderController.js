const cartModel = require("../models/cartModels.js")
const userModel = require('../models/userModel.js')
const productModel = require("../models/productsModel.js")
const orderModel = require("../models/orderModel.js")
const mongoose = require('mongoose');

//  =================================== Validation Value Of Create cart ==================

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (value === 0) return false
    return true;
}

const isValidstatus = function (availableSizes) {
    return ["pending", "completed", "cancled"].indexOf(status) !== -1;
}



//===========================================create order===================================================


const createorder = async function (req, res) {

    try {
        let userId = req.params.userId
        if (!userId) {
            return res.status(400).send({ status: false, msg: "userId not present" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: " invalid userId length" })
        }

        let finduser = await userModel.findById({ _id: userId })
        if(!finduser) {
            return res.status(404).send({ status: false, message: "user not found" })
        }

        let data = req.body;

        let { items,totalPrice, totalItems , totalQuantity, cancellable , status} = data

        if (Object.keys(data).length == 0) {
        return res.status(400).send({ status: false, msg: ' please Enter the order details ' })
        }

        if (!isValid(items)) {
            return res.status(400).send({ status: false, Message: "Please provide order items" })
        }

        if(items){
            let productId = req.body.productId
            if (!productId) {
                return res.status(400).send({ status: false, msg: "productId not present" })
            }
            if (!mongoose.isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: " invalid productId length" })
            }
    
            let findproduct = await productModel.findById({ _id: productId })
            if(!findproduct) {
                return res.status(404).send({ status: false, message: "product not found" })
            }

            if (!isValid(quantity)) {
                return res.status(400).send({ status: false, Message: "Please provide order quantity" })
            }

            if (!Number(quantity)) {
                return res.status(400).send({ status: !true, Message: " quantity must be a number" })
            }
            
        }


        if (!isValid(totalPrice)) {
            return res.status(400).send({ status: false, Message: "Please provide order totalprice" })
        }
        if (!Number(totalPrice)) {
            return res.status(400).send({ status: !true, Message: " price must be a number" })
        }
        if (!isValid(totalItems)) {
            return res.status(400).send({ status: false, Message: "Please provide order totalItems" })
        }
        if (!Number(totalItems)) {
            return res.status(400).send({ status: !true, Message: " totalItems must be a number" })
        }
        if (!isValid(totalQuantity)) {
            return res.status(400).send({ status: false, Message: "Please provide order totalQuantity" })
        }
        if (!Number(totalQuantity)) {
            return res.status(400).send({ status: !true, Message: " totalQuantity must be a number" })
        }

        if (!isValidstatus(status)) {
            return res.status(400).send({ status: false, message: "isValidstatus is missing or you left empty" });
        }

        const userData = await orderModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: userData })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }


}
//====================================Update Order==============================================

const updateOrder = async function(req,res){
    let userId = req.params.userId
    
    let user = await userModel.findById({_id:userId})
        if(!user){
return res.send("not present")
        }

    

    let orderId = req.body.orderId
    let order = await orderModel.findById({_id:orderId})
    if(order.userId !== user.userId){
        return res.status(404).send({msg:"not found"})
    }
    let update = await orderModel.findOneAndUpdate({_id:userId},{status:cancled},{new:true})
return res.send(update)
}


module.exports.createorder = createorder
module.exports.updateOrder = updateOrder