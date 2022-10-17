const cartModel = require("../models/cartModels.js")
const userModel = require('../models/userModel.js')
const productModel = require("../models/productsModel.js")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId
//  =================================== Validation Value Of Create cart ==================

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}




//  =================================== Validation Value Of Create cart ==================
const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        let { productId, quantity, cartId } = data

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "please provide some in the cart body" })
        }
        if (!userId)
            return res.status(400).send({ status: false, message: "userId is required" })

        if (!isValid(userId))
            return res.status(400).send({ status: false, message: "Incorrect userId" })

        if (!mongoose.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "Incorrect userId" })

        let user = await userModel.findById(userId)
        if (!user)
            return res.status(404).send({ status: false, message: "user not found" })

        if (!productId)
            return res.status(400).send({ status: false, message: "productId is required" })

        if (!isValid(productId))
            return res.status(400).send({ status: false, message: "Incorrect productId" })

        if (!mongoose.isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Incorrect productId" })


        if (cartId) {
            if (!isValid(cartId))
                return res.status(400).send({ status: false, message: "Incorrect cartId" })
            if (!mongoose.isValidObjectId(cartId))
                return res.status(400).send({ status: false, message: "Incorrect cartId" })

        }

        if (!quantity) {
            if (quantity == 0) return res.status(400).send({ status: false, message: "Quantity must be greater than 0" })
            quantity = 1
        }
        if (typeof quantity != "number") return res.status(400).send({ status: false, message: "Incorrect quantity" })

        let product = await productModel.findById(productId)
        if (!product || product.isDeleted == true) {
            return res.status(404).send({ status: false, message: "product not found" })
        }

        if (cartId) {
            const cart = await cartModel.findById(cartId).populate([{ path: "items.productId" }])
            if (!cart) return res.status(404).send({ status: false, message: "Cart does not exist with this cartId" })

            if (userId != cart.userId) {
                return res.status(403).send({ status: false, message: "not authorized" })
            }

            let itemsArr = cart.items
            let totalPrice = cart.totalPrice
            let totalItems = cart.totalItems
            let flag = true


            //if the product already exist in our cart
            for (i = 0; i < itemsArr.length; i++) {
                if (itemsArr[i].productId._id == productId) {
                    itemsArr[i].quantity += quantity
                    totalPrice += itemsArr[i].productId.price * quantity
                    flag = false
                }
            }
            
            //if product  not already exist  our cart then add the cart
            if (flag == true) {
                itemsArr.push({ productId: productId, quantity: quantity })
                totalPrice += product.price * quantity
            }

            totalPrice = totalPrice.toFixed(2)
            totalItems = itemsArr.length
            const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, ({
                items: itemsArr, totalPrice: totalPrice, totalItems: totalItems
            }), { new: true }).select({ __v: 0 })

            if (!updatedCart)
                return res.status(404).send({ status: false, message: "cart not found" })

            return res.status(200).send({ status: true, message: "Success", data: updatedCart })

        }
        else {
            let cartData = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                totalPrice: (product.price * quantity).toFixed(2),
                totalItems: quantity
            }
            const checkCart = await cartModel.findOne({ userId })
            if (checkCart) {
                return res.status(400).send({ status: false, message: `cart is already exist: cartId : ${checkCart._id}` })
            }
            const cart = await cartModel.create(cartData)
            return res.status(201).send({ status: true, message: "Success", data: cart })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: "plz enter the userId" })
        if (!isValid(userId)) return res.status(400).send({ status: false, message: "incorrect userId userId" })
        if (!userId.match(objectid)) return res.status(400).send({ status: false, message: "incorrect userId" })

        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: "user not found" })
        if (req.token.userId != userId) return res.status(403).send({ status: false, message: "Not Authorised" })

        let cart = await cartModel.findOne({ userId }).populate([{ path: "items.productId" }])
        if (!cart) return res.status(404).send({ status: false, message: "Cart not found for this user" })
        return res.status(200).send({ status: true, message: "cart details", data: cart })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}







//===========================================Get cart==============================================================


const getcart = async function (req, res) {
    try {
        let data = req.params.userId
        if (!data) {
            return res.status(400).send({ status: false, msg: "userId not present" })
        }
        if (!mongoose.isValidObjectId(data)) {
            return res.status(400).send({ status: false, message: " invalid userId length" })
        }
        let findcart = await cartModel.findById({ _id: data })
        if (!findcart) {
            return res.status(404).send({ status: false, message: "cart not found" })
        } else {
            return res.status(200).send({ status: true, message: "cart profile details", data: findcart })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }

}



// =======================Update Cart Api===============
const updatecart = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
        let { productId, cartId, removeProduct } = data

        // ========================Validation for user ID===========
        if (!userId) return res.status(400).send({ status: false, message: "Please provide userId!" })
        if (!isValid(userId)) return res.status(400).send({ status: false, msg: 'enter a valid userId in params' })

        // ========================Checking user ID Exsistance===========
        let userExsits = await cartModel.findOne(mongoose.isValidObjectId.userId)

        if (!userExsits) return res.status(404).send({ status: false, message: " user ID does not exists" })

        // ========================Validation for removeProduct===========
        if (!isValid(removeProduct)) return res.status(400).send({ status: false, msg: 'enter a valid removeProduct' })

        //============remove product must be 0 or 1=======================
        if (!(removeProduct == 1 || removeProduct == 0)) return res.status(400).send({ status: false, message: "please mention 1 or 0 only in remove product" })

        // ========================Validation for cart ID===========
        if (!cartId) return res.status(400).send({ status: false, message: "Please provide cardId!" })
        if (!isValid(cartId)) return res.status(400).send({ status: false, msg: 'enter a valid cartId' })

        // ========================Checking cart ID Exsistance===========
        let cartExsits = await cartModel.findById(cartId)

        if (!cartExsits) return res.status(404).send({ status: false, message: " Cart ID does not exists" })

        let cartItems = cartExsits.items

        if (cartExsits.userId.toString() !== userId) return res.status(403).send({ status: false, msg: "cart doesnot belongs to you" })

        //=============Checking Whether Items are avalable or not=================
        if (cartItems.length == 0) { return res.status(400).send({ status: false, message: "Nothing left to update!" }) }

        // ========================Validation for user ID===========
        if (!isValid(productId)) return res.status(400).send({ status: false, msg: 'enter a valid productId' })

        // ========================Checking user ID Exsistance===========
        let productExsits = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExsits) return res.status(404).send({ status: false, msg: 'no product found' })

        let productCheck = cartItems.findIndex(element => element.productId == productId);
        if (productCheck == -1) return res.status(404).send({ status: false, msg: "given product is not found in the cart" })
        let quantity = cartItems[productCheck].quantity;


        if (removeProduct == 0) {
            let updatedCart = await cartModel.findOneAndUpdate({ _Id: cartId, userId: userId, items: { $elemMatch: { productId: productId } } }, { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -quantity * productExsits.price } }, { new: true })
            return res.status(200).send({ status: true, msg: 'deleted Successfully', data: updatedCart })
        }
        if (quantity == 1) {
            let updatedCart = await cartModel.findOneAndUpdate({ _Id: cartId, userId: userId, items: { $elemMatch: { productId: productId } } }, { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -productExsits.price } }, { new: true })
            return res.status(200).send({ status: true, msg: 'deleted Successfully', data: updatedCart })
        }

        //===== product quantity is more than 1==============
        cartItems[productCheck].quantity -= 1;
        let updatedCart = await cartModel.findOneAndUpdate({ _Id: cartId, userId: userId, items: { $elemMatch: { productId: productId } } }, { items: cartItems, $inc: { totalPrice: -productExsits.price } }, { new: true })
        return res.status(200).send({ status: true, msg: 'deleted Successfully', data: updatedCart })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}


//===========================================delete cart=============================================================

const deletecart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.status(400).send({ status: false, msg: "userId not present" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: " invalid userId length" })
        }
        let findcart = await cartModel.findById({ _id: userId })
        if (!findcart) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }

        const checkcart = await cartModel.findOne({ _id: userId, isDeleted: false })

        if (!checkcart) {
            return res.status(404).send({ status: false, message: "cart allready delete so Not found " })
        }

        let deletedcart = await cartModel.findByIdAndUpdate({ _id: userId },
            { $set: { isDeleted: true, totalPrice: 0, totalItems: 0 } },
            { new: true });

        return res.status(200).send({ status: true, message: "product sucessfully deleted", deletedcart });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createCart, getcart, updatecart, deletecart }

