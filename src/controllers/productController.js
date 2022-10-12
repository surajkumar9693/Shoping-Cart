const productModel = require("../models/productsModel.js")
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
        if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) !== -1)) {
            res.status(400).send({ status: false, Message: "Please provide product's  wrong availableSizes" })
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


// ================================  Fetch Product By Qurery filters ===========================

const getProductByQuery = async function (req, res) {

    try {

        let data = req.query;
        let filter = { isDeleted: false };

    let{size, name, priceGreaterTha, priceLessThan, priceSort} = data;

        // if (size) {
        //     size = size.split(",").map(ele => ele.trim())
        //     if (Array.isArray(size)) {
        //         let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        //         let uniqueSizes = [...new Set(size)]
        //         for (let ele of uniqueSizes) {
        //             if (enumArr.indexOf(ele) == -1) {
        //                 return res.status(400).send({ status: false, message: `'${ele}' is not a valid size, only these sizes are available [S, XS, M, X, L, XXL, XL]` })
        //             }
        //         }
        //         filter["availableSizes"] = { $in: uniqueSizes };
        //     } else return res.status(400).send({ status: false, message: "size should be of type Array" })
        // }

        const foundProducts = await productModel.find(filter)
        return res.status(200).send({ status: "true", message: 'Success', data: foundProducts })










            } catch (error) {
                console.log(error)
                return res.status(500).send({ status: false, message: error.message })
            }








    }



































        module.exports = { createProduct, getProductByQuery } 
