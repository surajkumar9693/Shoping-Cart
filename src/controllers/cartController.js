const cartModel = require("../models/cartModels.js")
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






module.exports.getcart=getcart
module.exports.deletecart=deletecart