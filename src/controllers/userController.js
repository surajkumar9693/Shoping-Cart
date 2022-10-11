const userModel = require('../models/userModel.js')

//  =================================== Validation Value Of Create User ==================
const isValid = function (value) {
    if (typeof value !== 'String') {
        return false;
    }
    if (typeof value === 'string' && value.trim().length == 0) {
        return true;
    }
}


// ================================== Create User ===========================

const createUser = async function (req, res) {

    try {

        let data = req.body;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please enter Data" })
        }

        let { fname, lname, email, profileImage, password, phone, address } = data;

        // ================================== FistName And LastName =================================

        if (!fname) {
            return res.status(400).send({ status: false, message: "Please enter your fistName" })
        }

        if (!lname) {
            return res.status.send({ status: false, message: "Please enter your lestName" })
        }

        // ================================== Email  ===============================
        if (!email) {
            return res.status(400).send({ status: false, message: "Please enter email" })
        };
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is Empty" });
        };
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email.trim())) {
            return res.status(400).send({ status: false, message: "Email is invalid formet" });
        };

        let duplicateEmail = await userModel.findOne({ email: email })

        if (duplicateEmail) {
            return res.status(400).send({ status: false, message: "Email Already  Exists" })
        }





        // =================================== Create  ProfileImage link by AWS =======================
        if (!profileImage) {
            return res.status(400).send({ status: false, message: "Please enter a Profile Image" })
        }

        // ================================== Password And Phone Number ===============================
        if (!password) {
            return res.status(400).send({ status: false, message: "Please enter password" })
        }
        if (!phone) {
            return res.status(400).send({ status: false, message: "Please enter phone number" })
        }
        // ============================ Address of shipping ===========================
        if (!address) {
            return res.status(400).send({ status: false, message: "Please enter address" })
        }
        if (address && !address.shipping) {
            return res.status(400).send({ status: false, message: "Please enter shipping address" })
        }
        if (address && !address.shipping.street) {
            return res.status(400).send({ status: false, message: "Please enter street address" })
        }
        if (address && !address.shipping.city) {
            return res.status(400).send({ status: false, message: "Please enter city address" })
        }
        if (address && !address.shipping.pincode) {
            return res.status(400).send({ status: false, message: "Please enter pincode" })
        }

        // ============================ Address of Billing ==============================

        if (address && !address.billing) {
            return res.status(400).send({ status: false, message: "Please enter billing address" })
        }
        if (address && !address.billing.street) {
            return res.status(400).send({ status: false, message: "Please enter street address" })
        }
        if (address && !address.billing.city) {
            return res.status(400).send({ status: false, message: "Please enter city address" })
        }
        if (address && !address.billing.pincode) {
            return res.status(400).send({ status: false, message: "Please enter pincode" })
        }


        let userData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: userData })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }


}



// ================================== login User ===========================

const loginUser = async function (req, res) {
    try {

        let { email, password } = req.body

        if (!isVAlidRequestBody(req.body)) {
            return res.status(400).send({ status: false, msg: "please input email and password" })
        }

        // email is mandatory

        if (!email) {
            return res.status(400).send({ status: false, message: "EmailId is mandatory" })
        }

        // Password is mandatory

        if (!password) {
            return res.status(400).send({ status: false, message: "Password is mandatory" })
        }

        let DataChecking = await userModel.findOne({ email: email, password: password })
        if (!DataChecking) {
            return res.status(404).send({ msg: "Please enter valid email or password" })
        }

        let token = jwt.sign(
            {
                userId: DataChecking._id.toString(),
                batch: "Plutonium",
                organisation: "Project-5, Group-53"
            },
            "Products Management", {

            expiresIn: '10h' // expires in 10h

        });
        return res.status(201).send({ status: true, message: token })
    }
    catch (error) {
        res.status(500).send({
            status: false, message: error.message
        })
    }

}

module.exports.createUser = createUser;
module.exports.loginUser = loginUser;