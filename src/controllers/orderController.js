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
        if (!finduser) {
            return res.status(404).send({ status: false, message: "user not found" })
        }

        let cartId = req.body.cartId;

        if (!cartId) {
            return res.status(400).send({ status: false, msg: "cartId not given" })
        }

        if (!mongoose.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: " invalid cartId length" })
        }

        // let findcart = await cartModel.findOne({_id: cartId}) 

        let findcart = await cartModel.findById(cartId)

        if (!findcart) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        let totalQuantity = 0
        let cartitems = findcart.items
        for (let i = 0; i < cartitems.length; i++) totalQuantity += findcart.items[i].quantity


        let data = {
            totalQuantity: totalQuantity,
            items: findcart.items,
            totalPrice: findcart.totalPrice,
            totalItems: findcart.totalItems,
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

const updateOrder = async function (req, res) {
    let userId = req.params.userId

    let {status, orderId} = req.body

    if (!userId) {
        return res.status(400).send({ status: false, msg: "userId not provided" })
    }
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: " invalid userId length" })
    }

    let user = await userModel.findById({ _id: userId })
    if (!user) {
        return res.status(400).send({ status: false, message: " not found" })
    }

    let order = await orderModel.findById({ _id: orderId })
    
    if (order.userId !== user.userId) {
        return res.status(404).send({ msg: "not found" })
    }

    if (order.cancellable == false) {
        return res.status(200).send({ status: false, msg: " not cancelled" })
    } 

    let update = await orderModel.findOneAndUpdate({ _id: userId }, { status: cancled }, { new: true })
    return res.send(update)
}


module.exports.createorder = createorder
module.exports.updateOrder = updateOrder