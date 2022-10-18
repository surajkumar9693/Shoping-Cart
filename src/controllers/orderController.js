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
            return res.status(400).send({ status: false, msg: "userId not provided" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: " invalid userId length" })
        }

        let finduser = await userModel.findById({ _id: userId })
        if(!finduser) {
            return res.status(404).send({ status: false, message: "user not found" })
        }

        let cartId = req.body.cartId;
       
        console.log("cardId=>",cartId)

        if(!cartId){
            return res.status(400).send({ status: false, msg: "cartId not given" })
        }
    
        if (!mongoose.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: " invalid cartId length" })
        }

        let findcart = await cartModel.findOne({_id: cartId})
        const {items,totalPrice, totalItems ,  cancellable , status} = findcart

        // console.log("findcart=>",findcart)
        
        if(!findcart){
            return res.status(404).send({ status: false, message: "cart not found" })
        }

        
        let totalQuantity = findcart.items.reduce((a,b)=> a.quantity+ b.quantity);
        console.log(totalQuantity)
        let data = {
            totalQuantity: Number(totalQuantity),
            items:items,
            totalPrice:totalPrice,
            totalItems: totalItems, 
            cancellable: cancellable, 
            status: status,
            userId: userId
 
        }


        const orderData = await orderModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: orderData })

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