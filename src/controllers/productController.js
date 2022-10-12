
const productsModel = require('../models/productsModel.js')
const mongoose = require('mongoose');
const { uploadFile } = require("../aws/aws.js")

//  =================================== Validation Value Of Create product ==================

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (value === 0) return false
    return true;
}

const isValidavailableSizes = function (availableSizes) {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) !== -1;
};

// ================================== Create product ===========================

const createProduct = async function (req, res) {

    try {

        const requestBody = req.body

        if (Object.keys(requestBody).length == 0) {
            return res.status(400).send({ status: false, message: "Please enter Data" })
        }

        const { title, description, price, currencyId, currencyFormat,
            isFreeShipping, style, availableSizes, installments, } = requestBody


        if (!isValid(title)) {
            return res.status(400).send({ status: false, Message: "Please provide product's title" })
        }
        if (!isValid(description)) {
            return res.status(400).send({ status: false, Message: "Please provide product's description" })
        }
        if (!isValid(price)) {
            return res.status(400).send({ status: false, Message: "Please provide product's price" })

        }
        if (!Number(price)) {
            return res.status(400).send({ status: !true, Message: " price must be a number" })
        }
        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, Message: "Please provide currencyId" })
        }
        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, Message: "Please provide currency Format" })
        }
        if (!isValid(style)) {
            return res.status(400).send({ status: false, Message: "Please provide product's style" })
        }
        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, Message: "Please provide product's availableSizes" })
        }
        if (!isValidavailableSizes(requestBody.availableSizes)) {
            return res.status(400).send({ status: false, message: "availableSizes is missing or you left empty" });
        }

        // =================================== Create  ProfileImage link by AWS =======================
        let files = req.files

        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide The product Image" });
        }

        const uploadedImage = await uploadFile(files[0])
        requestBody.productImage = uploadedImage

        // ================= unique validation =====================

        const alreadysavetitle = await productsModel.findOne({ title: title });

        if (alreadysavetitle) {
            res.status(400).send({ status: false, message: `${title} title  is already exist` })
            return
        }

        const saveProductDetails = await productsModel.create(requestBody);
        return res.status(201).send({ status: true, message: "Product Successfully Created", data: saveProductDetails });

    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }

}



// ================================== delet product ===========================


const Deleteproduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!productId) {
            return res.status(400).send({ status: false, msg: "productId not present" })
        }
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: " invalid productId length" })
        }
        let findproduct = await productsModel.findById({ _id: productId })
        if (!findproduct) {
            return res.status(404).send({ status: false, message: "product not found" })
        }

        const checkproductId = await productsModel.findOne({ _id: productId, isDeleted: false })

        if (!checkproductId) {
            return res.status(404).send({ status: false, message: "product allready delete " })
        }

        let deletedproduct = await productsModel.findByIdAndUpdate({ _id: productId },
            { $set: { isDeleted: true } },
            { new: true });

        return res.status(200).send({ status: true, message: "product sucessfully deleted", deletedproduct });



    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }


}
module.exports.createProduct = createProduct;
module.exports.Deleteproduct = Deleteproduct;
