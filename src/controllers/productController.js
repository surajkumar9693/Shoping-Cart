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
        // let filter = { isDeleted: false };
        let filter = { isDeleted: false }
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide data In Params" })
        }

        let { size, name, priceGreaterThan, priceLessThan, priceSort } = data;


        if (size) {
            let filterSize = size.split(" ").filter(a => a).join("").toUpperCase().split(",")
            for (let i = 0; i < filterSize.length; i++) {
                if (!["S", "XS", "M", "L", "XXL", "XL"].includes(filterSize[i])) {
                    return res.status(400).send({ status: false, message: "Size should include 'S', 'XS', 'M', 'L', 'XXL' and  'XL' only." })
                }
                filter['availableSizes'] = filterSize
            }
        }

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





        if (name) {
            if (!isValid(name)) {
                return res.status(400).send({ stastus: false, message: "Invalid naming format!" })
            } filter['title'] = name

        }

        if (priceGreaterThan) {
            if (!Number(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "PriceGreaterThan Invalid formet" })
            } filter['price'] = { $gte: priceGreaterThan }
        }

        if (priceLessThan) {
            if (!Number(priceLessThan)) {
                return res.status(400).send({ status: false, message: "PriceLessThan  invalid formrt " })
            } filter['price'] = { $lte: priceLessThan }
        }

        if ((priceGreaterThan && priceLessThan) && (priceGreaterThan > priceLessThan)) {
            if (!Number(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "PriceGreaterThan Invalid formet" })
            }
            if (!Number(priceLessThan)) {
                return res.status(400).send({ stastus: false, message: "PriceLessThan Invalid formet" })
            }
            filter['price'] = { $gte: priceGreaterThan, $lte: priceLessThan }
        }

        // validation for price sorting
        if (priceSort) {
            if (!((priceSort == 1) || (priceSort == -1))) {
                return res.status(400).send({ status: false, message: 'In price sort it contains only 1 & -1' });
            }

            const products = await productModel.find().sort({ price: priceSort })
            if (!products) {
                return res.status(404).send({ status: false, message: "Not Found Products by price" })
            }
            return res.status(200).send({ status: true, message: "Success", data: products })
        }

        const foundProducts = await productModel.find(filter).sort({price : 1})                             //.select({ __v: 0 })
        if (!foundProducts.length > 0) {
            return res.status(404).send({ stastus: false, message: "Not Found Products" })
        }
        return res.status(200).send({ status: "true", message: 'Success', data: foundProducts })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
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

module.exports = { createProduct, getProductByQuery, Deleteproduct }
