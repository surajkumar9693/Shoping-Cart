const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const userModel = require('../models/userModel.js')


//--------------------------|| AUTHENTICATION ||--------------------------------

const authentication = async function (req, res, next) {
    try {
        token = req.headers['x-api-key']

        if (!token) { 
            return res.status(400).send({ status: false, message: "Token is missing" }) 
        }

        decodedToken = jwt.verify(token, "Products Management", (err, decode) => {
            if (err) {
                return res.status(400).send({ status: false, message: "Token is not correct!" })
            }
            req.decode = decode

            next()
        })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

//--------------------------|| AUTHORIZATION ||--------------------------------


const authorization = async function (req, res, next) {
    try {
      const token = req.headers["x-api-key"]; // we call headers with name x-api-key

      if (!token){
        res.status(401).send({ status: false, msg: "missing a mandatory token" })
      };

      let decodedToken = jwt.verify(token, "Products Management");

      let userLoggedIn = decodedToken.userId;

      let user = req.params.userId

      if (!mongoose.isValidObjectId(user)){
        return res.status(400).send({ status: false, msg: 'Please enter valid userId Id' })
      }
      let userData = await userModel.findOne({ _id: user });
      
      if (userData.userId.toString() != userLoggedIn) {
        return res.status(403).send({ status: false, msg: "You are not authrized" });
      }
      next();
    } catch (error) {
      res.status(500).send({ status: false, Error: error.message });
    }
  };

module.exports.authentication = authentication;
module.exports.authorization = authorization;