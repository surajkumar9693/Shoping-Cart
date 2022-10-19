const cartModel = require("../models/cartModels.js")
const userModel = require('../models/userModel.js')
const productModel = require("../models/productsModel.js")
const orderModel = require("../models/orderModel.js")
const mongoose = require('mongoose');

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
        return res.status(201).send({ status: true, message: "Success", data: orderData })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }


}

//====================================Update Order==============================================

const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId

        let { status, orderId } = req.body

        if (!['completed', 'cancled'].includes(status)) return res.status(400).send({ status: false, msg: 'status should take only canceled, completed' })


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

        if (order.status == 'completed') {
            return res.status(400).send({ status: false, msg: 'order is already completed, cannot be changed now' })
        }
        if (order.status == "cancelled") {
            return res.status(400).send({ status: false, msg: "order is already cancelled,cannot be changed now" })
        }
        if (order.cancellable == false && status == "cancelled") {
            return res.status(400).send({ status: false, msg: "order cannot be cancelled" })
        }

        if (order.cancellable == true && status == "cancelled") {
            let updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status: status }, { new: true })
            return res.status(200).send({ status: true, msg: 'order is cancelled', data: updatedOrder })
        }
        if (status == "completed") {
            let updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status: status }, { new: true })
            return res.status(200).send({ status: true, messge: 'Success', data: updatedOrder })
        }
    }
    catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createorder = createorder
module.exports.updateOrder = updateOrder