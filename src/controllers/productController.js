const productModel = require("../models/productsModel.js")
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
        if (currencyId != "INR") {
            return res.status(400).send({ Status: false, msg: "currency Id is not valid It should be INR " })
        }
        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, Message: "Please provide currency Format" })
        }
        if (currencyFormat != "₹") {
            return res.status(400).send({ Status: false, msg: "currencyFormat is not valid It should be ₹ " })
        }

        if (!isValid(style)) {
            return res.status(400).send({ status: false, Message: "Please provide product's style" })
        }
        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, Message: "Please provide product's availableSizes" })
        }
        if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) !== -1)) {
            return res.status(400).send({ status: false, Message: "Please provide product's  wrong availableSizes" })
        }
        if (!isValidavailableSizes(requestBody.availableSizes)) {
            return res.status(400).send({ status: false, message: "availableSizes is missing or you left empty" });
        }

        // =================================== Create  ProfileImage link by AWS =======================
        let files = req.files

        let profile = files[0].originalname;

        if (!(/\.(jpe?g|png|webp|jpg)$/i).test(profile)) {
            return res.status(400).send({ status: false, message: " Please provide only image  of format only-> jpe?g|png|webp|jpg" })
        }

        if (!(files && files.length > 0)) {
            return res.status(400).send({ status: false, message: "Please Provide The product Image" });
        }

        const uploadedImage = await uploadFile(files[0])
        requestBody.productImage = uploadedImage

        // ================= unique validation =====================

        const alreadysavetitle = await productModel.findOne({ title: title });

        if (alreadysavetitle) {
            res.status(400).send({ status: false, message: `${title} title  is already exist` })
            return
        }

        const saveProductDetails = await productModel.create(requestBody);
        return res.status(201).send({ status: true, message: 'Success', data: saveProductDetails });

    }
    catch (err) {
        console.log(err);
        res.status(500).send({ status: false, Message: err.message })
    }

}


// ================================  Fetch Product By Qurery filters ===========================

const getProductByQuery = async function (req, res) {

    try {

        let data = req.query;

        let filter = { isDeleted: false }
        // if (Object.keys(data).length == 0) {
        //     return res.status(400).send({ status: false, message: "Please Provide data In Params" })
        // }

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

        if (name) {
            if (!isValid(name)) {
                return res.status(400).send({ stastus: false, message: "Invalid naming format!" })
            } filter['title'] = name

        }

        if (priceGreaterThan) {
            if (!Number(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "PriceGreaterThan Invalid formet" })
            } filter['price'] = { $gt: priceGreaterThan }
        }

        if (priceLessThan) {
            if (!Number(priceLessThan)) {
                return res.status(400).send({ status: false, message: "PriceLessThan  invalid formrt " })
            } filter['price'] = { $lt: priceLessThan }
        }

        if ((priceGreaterThan && priceLessThan) && (priceGreaterThan > priceLessThan)) {
            if (!Number(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "PriceGreaterThan Invalid formet" })
            }
            if (!Number(priceLessThan)) {
                return res.status(400).send({ stastus: false, message: "PriceLessThan Invalid formet" })
            }
            filter['price'] = { $gt: priceGreaterThan, $lt: priceLessThan }
        }

        //validation for name sorting

        if (name || name == '') {
            if (!isValid(name)) return res.status(400).send({ stastus: false, message: "Invalid naming format!" });
            const regex = new RegExp(name, 'g')
            filter.title = regex;
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

        const foundProducts = await productModel.find(filter).sort({ price: 1 })                            //.select({ __v: 0 })
        if (!foundProducts.length > 0) {
            return res.status(404).send({ stastus: false, message: "Not Found Products" })
        }
        return res.status(200).send({ status: true, message: 'Success', data: foundProducts })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

//=====================================get Product By Id===========================

const getProductById = async function (req, res) {
    try {
        let data = req.params.productId

        if (!mongoose.isValidObjectId(data)) {
            return res.status(400).send({ status: false, message: " invalid productId " })
        }
        let allProducts = await productModel.findById({ _id: data })
        if (!allProducts || allProducts.isDeleted === true) {
            return res.status(404).send({ status: false, message: "product not found" })
        } else {
            res.status(200).send({ status: true, message: "Success", data: allProducts })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

// ==============Update API==================
const updateProductById = async function (req, res) {
    try {
        let productId = req.params.productId;
        let files = req.files

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: " invalid productId " })
        }
        if (!isValid(productId)) return res.status(400).send({ status: false, msg: 'product Id is not valid' })
        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, msg: 'no product found  or the product is deleted' })

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, msg: 'Enter the details for update' })

        let data = req.body;
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;

        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, msg: 'enter the valid title for product' })
            let dupTitle = await productModel.findOne({ title: title })
            if (dupTitle) return res.status(400).send({ status: false, msg: 'title is already is present' })
        }

        // description validation
        if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, msg: 'description is not valid' })
        }

        ///price validation
        if (currencyId) {
            if (!isValid(currencyId)) return res.status(400).send({ Status: false, msg: "currency Id is not valid" })
            if (currencyId != "INR") return res.status(400).send({ Status: false, msg: "currency Id is not valid It should be INR" })

        }

        if (currencyFormat) {
            if (!isValid(currencyFormat)) return res.status(400).send({ Status: false, msg: "currencyFormat is not valid" })
            if (currencyFormat != "₹") return res.status(400).send({ Status: false, msg: "currencyFormat is not valid It should be ₹" })
        }

        if (price) {
            if (!Number(price)) return res.status(400).send({ status: false, msg: 'price is not valid' })
            if (Number(price) <= 0) return res.status(400).send({ status: false, msg: 'price cannot be zero or negative' })
        }
        if (installments) {
            if (!Number(installments)) return res.status(400).send({ status: false, msg: 'installment is not valid' })
            if (Number(installments) <= 0) return res.status(400).send({ status: false, msg: 'installment cannot be zero or negative' })
        }
        if (isFreeShipping) {
            if (isFreeShipping != "true" && isFreeShipping != "false") return res.status(400).send({ status: false, msg: 'invalid parameter in isFreeShipping' })
        }
        if (style) {
            if (!isValid(style)) return res.status(400).send({ status: false, msg: 'Style description is not valid' })
        }

        let size = availableSizes.split(",")
        
        if (availableSizes) {
            for (let i = 0; i < size.length; i++) {
                if (!(["XS", "X", "S", "M", "L", "XL", "XXL"].includes(size[i]))) {
                    return res.status(400).send({ status: false, message: `invalid size parameter, Sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            
                for (let c of product.availableSizes) {
                    console.log(c)
                    if (c == size[i]) {
                        return res.status(400).send({ status: false, message: `${size[i]} already exists ` })
                    }
                }
                product.availableSizes.push(size[i])
            }
            data.availableSizes = product.availableSizes
        }
        //=====================if product image is present===================
        if (files.length > 0) {

            let profile = files[0].originalname;

            if (!(/\.(jpe?g|png|webp|jpg)$/i).test(profile)) {
                return res.status(400).send({ status: false, message: " Please provide only image  of format only-> jpe?g|png|webp|jpg" })
            }

            if (!(files && files.length > 0)) {
                return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
            }

            var uploadedProfileImage = await uploadFile(files[0])
            data.profileImage = uploadedProfileImage
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false },
            { $set: data },
            { new: true })
        return res.status(200).send({ status: true, msg: 'Update product details is successful', data: updatedProduct })

    }

    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
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
            return res.status(400).send({ status: false, message: " invalid productId or invalid product length" })
        }
        let findproduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findproduct) {
            return res.status(404).send({ status: false, message: "product not found or already delete" })
        }

        let deletedproduct = await productModel.findOneAndUpdate({ _id: productId },
            { $set: { isDeleted: true } },
            { new: true });

        return res.status(200).send({ status: true, message: "product sucessfully deleted", deletedproduct });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createProduct, getProductByQuery, getProductById, updateProductById, Deleteproduct }
