const cartModel = require("../models/cartModels.js")
const userModel = require('../models/userModel.js')
const productModel = require("../models/productsModel.js")
const mongoose = require('mongoose');

//  =================================== Validation Value Of Create cart ==================

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


//=========================================== create cart============================================================


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
            return res.status(200).send({ status: true,message:"cart profile details", data: findcart })
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
        let userExsits = await cartModel.findOne({ userId: userId })
       
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
        if(productCheck == -1) return res.status(404).send({status:false,msg:"given product is not found in the cart"})
        let quantity = cartItems[productCheck].quantity;
        
       
        if(removeProduct == 0){ 
            let updatedCart = await cartModel.findOneAndUpdate({_Id:cartId,userId : userId, items:{$elemMatch : {productId : productId}}},{$pull : {items:{productId:productId}},$inc:{totalItems:-1,totalPrice:-quantity*productExsits.price}},{new:true})
            return res.status(200).send({status:true,msg:'deleted Successfully', data:updatedCart})
        }
        if(quantity == 1){ 
            let updatedCart = await cartModel.findOneAndUpdate({_Id:cartId,userId : userId, items:{$elemMatch : {productId : productId}}},{$pull : {items:{productId:productId}},$inc:{totalItems : -1, totalPrice : -productExsits.price}}, {new:true})
            return res.status(200).send({status:true,msg:'deleted Successfully', data:updatedCart})
        }

        //===== product quantity is more than 1===============
        cartItems[productCheck].quantity -=1;
        let updatedCart = await cartModel.findOneAndUpdate({_Id:cartId,userId : userId, items:{$elemMatch : {productId : productId}}},{items : cartItems,$inc:{totalPrice : -productExsits.price}}, {new:true})
            return res.status(200).send({status:true,msg:'deleted Successfully', data:updatedCart})

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
            { $set: { isDeleted: true ,totalPrice:0, totalItems:0 } },
            { new: true });

        return res.status(200).send({ status: true, message: "product sucessfully deleted", deletedcart });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createCart,getcart, updatecart, deletecart }

