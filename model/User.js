const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    fname: {
        type: String
    },
    lname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phno: {
        type: Number
    },
    gender: {
        type: String
    },
    Tokens: [{
        token: {
            type: String
        }
    }]
})

userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10)
            next()
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = new mongoose.model("User", userSchema)