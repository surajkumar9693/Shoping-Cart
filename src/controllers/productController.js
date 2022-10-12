
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

const isValidavailableSizes = function (title) {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(title) !== -1;
  };

// ================================== Create User ===========================

const createProduct = async function (req, res) {

    try {

        const requestBody = req.body

        if (Object.keys(requestBody).length == 0) {
            return res.status(400).send({ status: false, message: "Please enter Data" })
        }

        const { title, description, price, currencyId, currencyFormat,
            isFreeShipping, style, availableSizes, installments, } = requestBody


        if (!isValid(title)) {
            res.status(400).send({ status: false, Message: "Please provide product's title" })
            return
        }
        if (!isValid(description)) {
            res.status(400).send({ status: false, Message: "Please provide product's description" })
            return
        }
        if (!isValid(price)) {
            res.status(400).send({ status: false, Message: "Please provide product's price" })
            return
        }
        if (!Number(price)) {
            return res.status(400).send({ status: !true, Message: " price must be a number" })
        }
        if (!isValid(currencyId)) {
            res.status(400).send({ status: false, Message: "Please provide currencyId" })
            return
        }
        if (!isValid(currencyFormat)) {
            res.status(400).send({ status: false, Message: "Please provide currency Format" })
            return
        }
        if (!isValid(style)) {
            res.status(400).send({ status: false, Message: "Please provide product's style" })
            return
        }
        if (!isValid(availableSizes)) {
            res.status(400).send({ status: false, Message: "Please provide product's availableSizes" })
            return
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


module.exports.createProduct = createProduct;
