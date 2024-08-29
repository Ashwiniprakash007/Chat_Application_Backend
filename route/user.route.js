const express = require("express");
const userModal = require("../modals/user.modal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userController = express.Router();

userController.post("/register", async (req, res) => {
    const { email, password,name } = req.body;
    console.log("Received data:", { name, email, password });
    try {
        const hash = await bcrypt.hash(password, 6);
        const user = new userModal({name, email, password: hash });
        await user.save();
        
        res.send({ message: "Signup successful", userId: user.userId });
        
    } catch (err) {
        console.log("message==>", err.message)
        res.status(500).send("Please try again");
    }
});

userController.post("/login", async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await userModal.findOne({ name });

        if (!user) {
            return res.status(400).send("Invalid Credentials");
        }

        const hash = user.password;

        bcrypt.compare(password, hash, (err, result) => {
            if (result) {
                const token = jwt.sign({ name, userId: user._id }, "secret");
                return res.send({ message: "Login success", token: token, userId: user._id });
            } else {
                return res.status(400).send("Invalid Credentials");
            }
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});


userController.get("/all", async (req, res) => {
    try {
        const users = await userModal.find({}, 'name'); 
        res.send(users);
    } catch (err) {
        console.error(err); 
        res.status(500).send("Error fetching users");
    }
});


module.exports = userController;


