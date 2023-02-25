const jwt = require("jsonwebtoken")
const Admin = require("../model/Admin")


const aauth = async (req, resp, next) => {
    const token = req.cookies.ajwt
    try {
        const adminInfo = await jwt.verify(token, process.env.AKEY)

        const admin = await Admin.findOne({ _id: adminInfo._id })

        req.token = token
        req.admin = admin

        next();

    } catch (error) {
        resp.render("adminlogin", { msg: "please login first" })
    }
}


module.exports = aauth;