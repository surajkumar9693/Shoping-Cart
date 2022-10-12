const productModel = require("../models/productsModel.js")



// ========================= fetch Producta by Qurery =================

const productsModel = require('../models/productsModel.js')

//  =================================== Validation Value Of Create product ==================

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (value === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

// ================================== Create User ===========================

const createProduct = async function (req, res) {

    try {

        const requestBody = req.body

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: " Please provide user details" })

        }

        const { title, description, price, currencyId, currencyFormat,
            isFreeShipping, style, availableSizes, installments } = requestBody


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

        // =================================== Create  ProfileImage link by AWS =======================
        let files = req.files

        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
        }

        const uploadedProfileImage = await uploadFile(files[0])
        requestBody.profileImage = uploadedProfileImage



        // ================= unique validation =====================

        const alreadysavetitle = await productsModel.findOne({ title: title });

        if (alreadysavetitle) {
            res.status(400).send({ status: false, message: `${title} title  is already exist` })
            return
        }

        //=============================================== creat product =================================

        let ProductData = {
            title: title,
            description: description,
            price: price,
            currencyId: currencyId,
            currencyFormat: currencyFormat,
            isFreeShipping: isFreeShipping,
            productImage: productImage,  // s3 link
            style: style,
            availableSizes: availableSizes,
            installments: installments

        }

        const saveProductDetails = await productsModel.create(ProductData);
        return res.status(201).send({ status: true, message: "Product Successfully Created", data: saveProductDetails });

    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }

}


// ================================  Fetch Product By filters ===========================

const getProductByQuery = async function (req, res) {

    try {

        let data = req.query;
        let filter = { isDeleted: false };

    let{size, name, priceGreaterTha, priceLessThan, priceSort} = data;

        if (size) {
            size = size.split(",").map(ele => ele.trim())
            if (Array.isArray(size)) {
                let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                let uniqueSizes = [...new Set(size)]
                for (let ele of uniqueSizes) {
                    if (enumArr.indexOf(ele) == -1) {
                        return res.status(400).send({ status: false, message: `'${ele}' is not a valid size, only these sizes are available [S, XS, M, X, L, XXL, XL]` })
                    }
                }
                filter["availableSizes"] = { $in: uniqueSizes };
            } else return res.status(400).send({ status: false, message: "size should be of type Array" })
        }

        const foundProducts = await productModel.find(filter)
        return res.status(200).send({ status: "true", message: 'Success', data: foundProducts })










            } catch (error) {
                console.log(error)
                return res.status(500).send({ status: false, message: error.message })
            }








        }



































        module.exports = { createProduct, getProductByQuery } 
