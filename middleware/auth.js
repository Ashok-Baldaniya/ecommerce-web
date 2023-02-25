const jwt = require("jsonwebtoken")
const User = require("../model/User")

const auth = async function (req, resp, next) {
    const token = req.cookies.jwt
    try {
        const userInfo = await jwt.verify(token, process.env.SKEY)
        const user = await User.findOne({ _id: userInfo._id })

        const tk = user.Tokens.filter(ele => {
            return ele.token == token
        });

        if (tk[0] == undefined) {
            resp.render("userlogin", { msg: "Please login first" })
        }
        else {
            req.token = token
            req.user = user;
            next();
        }
    } catch (error) {
        resp.render("userlogin", { msg: "please login first" })
    }
}

module.exports = auth