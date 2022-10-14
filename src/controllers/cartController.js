const cartModel = require("../models/cartModel.js")
const userModel = require('../models/userModel.js')
const productModel = require("../models/productsModel.js")
const mongoose = require('mongoose');

//  =================================== Validation Value Of Create cart ==================

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (value === 0) return false
    return true;
}

const createCart = async function (req, res) {
    try {

        let userId = req.params.userId;
        let bodyData = req.body;
        const { productId, cartId } = bodyData;

        // validation for empty body
        if (Object.keys(bodyData).length == 0) {
            return res.status(400).send({ status: false, message: "Request body cannot remain empty" });
        }
        if (!userId) {
            return res.status(400).send({ status: false, message: "Please provide UserId" })
        }
        // validation for userId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `userId  is not in proper format` });
        }
        // finding the user
        let findUser = await userModel.findById(userId)
        if (!findUser) {
            return res.status(404).send({ status: false, message:" User details not found "});
        }


        if (!(productId)) {
            return res.status(400).send({ status: false, message: "Please provide productId" });
        }

        if (!mongoose.isValidObjectId(productId))
            return res.status(400).send({ status: false, message: `ProductId is not in proper format` });

        // finding the product
        const findProduct = await productModel.findById(productId);
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "Product details are not found please select the product items" });
        }

    

        let cart = await cartModel.findOne({ userId: userId })

        if (cartId) {
            if (!mongoose.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Invalid cartId!" })
         
        }

        let data = { userId: userId, items: [], totalPrice: 0, totalItems: 0 }
        if (!cart) {

            let obj = {}
            obj["productId"] = productId
            obj["quantity"] = 1
            data.items.push(obj)
            data["totalPrice"] = uniqueProduct.price
            data["totalItems"] = 1

            let createCart = await cartModel.create(data)
            res.status(201).send({ status: true, message: "successful", data: createCart })
        }

        let items = cart.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].productId == productId) {
                items[i].quantity += 1
                // cart.totalPrice += uniqueProduct.price
                let updated = await cartModel.findOneAndUpdate({
                    _id: cart._id
                }, {
                    $set: { items: items, totalPrice: cart.totalPrice }
                }, { new: true })
                return res.status(200).send({ status: true, message: "Successfully updated the cart, increased quantity!", data: updated })
            }
        }


        let newObj = {}
        newObj["productId"] = productId
        newObj["quantity"] = 1
        items.push(newObj)
        cart.totalPrice += uniqueProduct.price
        cart.totalItems += 1

        let finalData = await cartModel.findOneAndUpdate({ _id: cart._id }, { $set: { items: items, totalPrice: cart.totalPrice, totalItems: cart.totalItems } }, { new: true })
        return res.status(200).send({ status: true, message: "Product has been added in the cart!", data: finalData })



    } catch (error) {
        console.log(error)
        return res.status(400).send({ status: false, message: error.message })
    }
}













module.exports = { createCart }