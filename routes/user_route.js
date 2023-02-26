//All user API's is in this route....

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserModel = mongoose.model('UserModel');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config')
var fetchuser = require('../middleware/fetchuser')



router.post("/signup", [
    body('fullName', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {

        //check whether user is exist already....
        let user = await UserModel.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "User with is email already exist." })
        }
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(req.body.password, salt); //to hash the password....

        //Create the user.
        user = await UserModel.create({
            fullName: req.body.fullName,
            password: securePassword,
            email: req.body.email,
        })

        // .then((user) => res.json(user));  //tocheck the user is created or not
        const userIdData = {
            UserModel: {
                id: UserModel.id
            }
        }
        const authentication = jwt.sign(userIdData, JWT_SECRET);
        res.json({ authentication });  //token generated for id
    }
    catch (error) {  //if any error occured this statement catch the error.
        console.log(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//LOGIN

router.post("/login", [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            res.status(400).json({ error: "Please try to login with correct credentials" })
        }

        //Compare password

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct creadentials" })
        }

        const userIdData = {
            UserModel: {
                id: UserModel.id
            }
        }
        const authentication = jwt.sign(userIdData, JWT_SECRET);
        res.json({ authentication });  //token generated for id
    }
    catch (error) {  //if any error occured this statement catch the error.
        console.log(error.message);
        res.status(500).send("Internal Server Error")
    }
});


//Get Logged user details.

router.post("/getuser", fetchuser, async (req, res) => {

    try {
        const userId = req.UserModel.id;
        console.log({ userId });
        const user = await UserModel.findById(userId).select("-password"); //-password means we selected all the fields except password
        res.send(user);
        console.log(user);

    } catch (error) {  //if any error occured this statement catch the error.
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;