const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String},
    password: {type:String, required:true},
    userId: { type: String, default: uuidv4 }
});

const userModal = mongoose.model("user", userSchema)
module.exports = userModal
