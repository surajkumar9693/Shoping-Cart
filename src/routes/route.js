const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const MW =require("../middleware/middleware.js")



router.get('/test-me', function (req, res) {
    return res.status(200).send({status:true, message:"My fist Api "})
})

// =================================== Create User ============================
router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", MW.authentication, userController.getUsers)
router.put("/user/:userId/profile",MW.authentication ,MW.authorization,userController.updateUser)

// =================================== product User ============================

router.post("/products", productController.createProduct)
router.get("/products", productController.getProductByQuery)
router.get("/products/:productId",productController.getProductById) 
router.put("/products/:productId", productController.updateProductById)
router.delete("/products/:productId", productController.Deleteproduct)

// =================================== product User ============================

router.post("/users/:userId/cart", cartController.createCart)
// router.put("/users/:userId/cart", cartController.updatecart)
// router.get("/users/:userId/cart", cartController.getcart)
// router.delete("/users/:userId/cart", cartController.deletecart)



// ============================  Checking all request validation ========================
router.all("/**", function (req, res) {
    return res.status(400).send({status:false , message: "Invalid request"})
})
module.exports = router;
