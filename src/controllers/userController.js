const userModel = require('../models/userModel.js')
const bcrypt = require("bcrypt")

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
        if (typeof email !== "String" && email.trim().length == 0) {
            return res.status(400).send({ status: false, message: "FistName is Empty" });
        }

        if (!lname) {
            return res.status.send({ status: false, message: "Please enter your lestName" })
        }
        if (typeof email !== "String" && email.trim().length == 0) {
            return res.status(400).send({ status: false, message: "LastName is Empty" });
        }

        // ================================== Email  ===============================
        if (!email) {
            return res.status(400).send({ status: false, message: "Please enter email" })
        };
        if (typeof email !== "String" && email.trim().length == 0) {
            return res.status(400).send({ status: false, message: "Email is Empty" });
        }
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email.trim())) {
            return res.status(400).send({ status: false, message: "Email is invalid formet" });
        };

        const  duplicateEmail = await userModel.findOne({ email: email })

        if (duplicateEmail) {
            return res.status(400).send({ status: false, message: "Email Already  Exist" })
        }





        // =================================== Create  ProfileImage link by AWS =======================
        if (!profileImage) {
            return res.status(400).send({ status: false, message: "Please enter a Profile Image" })
        }








        // ==================================  Phone Number ===============================
        if (!phone) {
            return res.status(400).send({ status: false, message: "Please enter phone number" })
        }
        if (phone.trim().length == 0) {
            return res.status(400).send({ status: false, message: "Phone is Empty" })
        }
        if (!/^[789]\d{9}$/.test(phone.trim())) {
            return res.status(400).send({ status: false, message: "Phone is Invalid" })
        }
        const duplicatePhone = await userModel.findOne({ phone: phone })
        if (duplicatePhone) {
            return res.status(400).send({status :false , message : "Phone Already Exist"})
        }


        // ================================== Password  ===============================
        if (!password) {
            return res.status(400).send({ status: false, message: "Please enter password" })
        }
        if (typeof password !== "string" && password.trim().length == 0) {
            return res.status(400).send({ status: false, message: "Password is Empty" })
        }
        if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password.trim())) {
            return res.status(400).send({ status: false, message: "Password is Invalid , Please Enter minLen 8, maxLen 15  " })
        }



        // ============================ Address  =========================== ye kaam nhi kar rha hai 

        // if (address  && typeof address!== Object ) {
        //     return res.status(400).send({ status: false, message: "Address is Empty" });
        // }

        //  // ============================ Address of shipping ===========================


        if (address) {
        let shipping = address.shipping;
        let street = address.shipping.street;
        let city = address.shipping.city;
        let pincode = address.shipping.pincode;

        if (!shipping) {
            return res.status(400).send({ status: false, message: "Please enter shipping address" })
        }
        //  ye kaam nhi kar rha hai
        // if (typeof address.shipping !== Object) {
        //     return res.status(400).send({ status: false, message: "Address of shipping is Empty" });
        // }
        if (!street) {
            return res.status(400).send({ status: false, message: "Please enter street address" })
        }
        if (street.trim().length == 0) {
            return res.status(400).send({ status: false, message: "Street of shipping is Empty" });
        }
        if(typeof street !== "string") {
            return res.status(400).send({status :false , message: "Street of shipping is Invalid"})
        }
        

        if (!city) {
                return res.status(400).send({ status: false, message: "Please enter city address" })
            }
        if (city.trim().length == 0) {
            return res.status(400).send({ status: false, message: "City of shipping  is Empty " })
        }
        if (typeof street !== "string") {
            return res.status(400).send({ status: false, message: "Street of shipping is Invalid" })
        }

        if (!pincode) {
            return res.status(400).send({ status: false, message: "Please enter pincode" })
        }


        if (pincode.toString().trim().length == 0) {
            return res.status(400).send({ status: false, message: "Pincode Of shipping is Empty" })
        }
        // ye kaam nhi kar rha hai 
        // if (typeof pincode !== Number) {
        //     return res.status(400).send({ status: false, message: "Pincode Invalid Formet tpyeOf" })
        // }
        if (!/^[1-9][0-9]{5}$/.test(pincode)) {
            return res.status(400).send({ status: false, message: "PinCode Invalid , Please provide 6 Digit Number" })
        }


        // ============================ Address of Billing ==============================
        let billing = address.billing;
        let b_street = address.billing.street;
        let b_city = address.billing.city;
        let b_pincode = address.billing.pincode;

        if (!billing) {
            return res.status(400).send({ status: false, message: "Please enter billing address" })
        }
          // ye kaam nhi kar rha hai 
        // if (typeof address.billing !== Object) {
        //     return res.status(400).send({ status: false, message: "Address of billing is Empty" });
        // }
        if (!b_street) {
            return res.status(400).send({ status: false, message: "Please enter street address of billing " })
        }
        if (b_street.trim().length == 0) {
            return res.status(400).send({ status: false, message: "Street of billing is Empty" });
        }
        if (typeof b_street !== "string") {
            return res.status(400).send({ status: false, message: "Street of billing is Invalid" })
        }


        if (!b_city) {
            return res.status(400).send({ status: false, message: "Please enter city address of billing" })
        }
        if ( b_city.trim().length == 0) {
            return res.status(400).send({ status: false, message: "City of billing  is Empty " })
        }
        if (typeof b_city !== "string") {
            return res.status(400).send({status:false, message : "City of billing is Invalid"})
        }
        if (!b_pincode) {
            return res.status(400).send({ status: false, message: "Please enter pincode" })
        }


        if ( b_pincode.toString().trim().length == 0) {
            return res.status(400).send({ status: false, message: "Pincode Of billing is Empty" })
        }
        if (typeof b_pincode !== Number) {
            return res.status(400).send({ status: false, message: "Pincode Of billing is invalid typeof" })
        }
        if (!/^[1-9][0-9]{5}$/.test(b_pincode)) {
            return res.status(400).send({ status: false, message: "PinCode Invalid , Please provide 6 Digit Number" })
            }
        }




        //  bcrypt  Password and reAssign
        const hash = await bcrypt.hash(password, 10);
        data.password = hash;


        const userData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: userData })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }


}


module.exports.createUser = createUser;