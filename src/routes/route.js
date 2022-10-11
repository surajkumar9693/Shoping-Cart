const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const middleware = require("../middleware/middleware.js")
const MW =require("../middleware/middleware.js")



router.get('/test-me', function (req, res) {
    return res.status(200).send({status:true, message:"My fist Api "})
})

// =================================== Create User ============================
router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/",MW.authentication , userController.getUsers)

// ============================ AWS=========================


router.all("/**", function (req, res) {
    return res.status(400).send({status:false , message: "Invalid request"})
})
module.exports = router;
