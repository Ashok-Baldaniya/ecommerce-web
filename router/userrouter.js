const router = require("express").Router()
const User = require("../model/User")
const Category = require("../model/Category")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth")
const Product = require("../model/Product")
const Cart = require("../model/Cart")

router.get("/", async (req, resp) => {
    try {
        const data = await Category.find()
        const prod = await Product.find()
        resp.render("index", { cdata: data, pdata: prod })
    } catch (error) {
        console.log(error);
    }
})

router.get("/checkout", (req, resp) => {
    resp.render("checkout")
})

router.get("/contact", (req, resp) => {
    resp.render("contact")
})

router.get("/detail", (req, resp) => {
    resp.render("detail")
})


router.get("/shop", auth, async (req, resp) => {
    try {
        const data = await Category.find()
        const prod = await Product.find()
        resp.render("shop", { pdata: prod, cdata: data })
    } catch (error) {
        console.log(error);
    }
})

router.get("/findByCat", async (req, resp) => {
    const id = req.query.catid
    try {
        const prod = await Product.find({ cid: id })
        const data = await Category.find()
        resp.render("shop", { pdata: prod, cdata: data })
    } catch (error) {
        console.log(error);
    }
})

router.get("/cart", auth, async (req, resp) => {
    const uid = req.user._id
    try {
        const cartdata = await Cart.aggregate([{ $match: { uid: uid } }, { $lookup: { from: "products", localField: "pid", foreignField: "_id", as: "products" } }])
        let sum = 0;
        for (var i = 0; i < cartdata.length; i++) {
            sum = sum + cartdata[i].total
        }
        resp.render("cart", { cartd: cartdata, subtotal: sum })
    } catch (error) {
        console.log(error);
    }
})

router.get("/changeqty", async (req, resp) => {
    const cartid = req.query.cartid
    try {
        const newdata = await Cart.findOne({ _id: cartid })
        const prddata = await Product.findOne({ _id: newdata.pid })

        const totalqty = Number(newdata.qty) + Number(req.query.qty)
        const pricetotal = prddata.price * totalqty
        const fqty = Number(prddata.qty) - Number(req.query.qty)

        await Product.findByIdAndUpdate({ _id: prddata._id }, { qty: fqty })
        const cartQty = await Cart.findByIdAndUpdate(cartid, { qty: totalqty, total: pricetotal })

        resp.send("Cart Data Change success.....")
    } catch (error) {
        console.log(error);
    }
})

router.get("/deletecart", auth, async (req, resp) => {
    const _id = req.query.did

    try {
        await Cart.findByIdAndDelete(_id)
        resp.send("deleted successfully....")
    } catch (error) {
        console.log(error);
    }
})

router.get("/addtocart", auth, async (req, resp) => {
    const pid = req.query.pid
    const uid = req.user._id
    const qty = req.query.qty

    const allcart = await Cart.find({ uid: uid })
    const prodcart = await Product.findOne({ _id: pid })
    const newqty = Number(prodcart.qty) + Number(qty)

    const duplicate = await allcart.find(ele => {
        return ele.pid == pid
    })

    try {
        if (duplicate) {
            resp.send("Already Exists...!!!")
        }
        else {
            const cart = new Cart({
                pid: pid,
                uid: uid,
                total: prodcart.price
            })
            await Product.findByIdAndUpdate({ _id: pid }, { qty: newqty })
            await cart.save()
            resp.send("product added into Cart")
        }


    } catch (error) {
        console.log(error);
    }
})

router.get("/registrationpage", (req, resp) => {
    resp.render("userregistration")
})

router.post("/userregistration", async (req, resp) => {
    try {
        const data = new User(req.body)
        await data.save()
        resp.render("userregistration", { msg: "registration successfully..!!!" })
    } catch (error) {
        console.log(error);
    }
})

router.get("/loginpage", (req, resp) => {
    resp.render("userlogin")
})

router.post("/userlogin", async (req, resp) => {
    try {
        const data = await User.findOne({ email: req.body.email })
        const isvalid = await bcrypt.compare(req.body.password, data.password)
        if (isvalid) {
            const token = await jwt.sign({ _id: data._id }, process.env.SKEY)
            data.Tokens = data.Tokens.concat({ token })
            data.save()
            resp.cookie("jwt", token)
            resp.render("index")
        }
        else {
            resp.render("userlogin", { msg: "password" })
        }
    } catch (error) {
        resp.render("userlogin", { msg: "invalid email or password" })
    }
})

router.get("/userlogout", auth, async (req, resp) => {
    try {
        resp.clearCookie("jwt")
        resp.redirect("loginpage")
    } catch (error) {
        console.log(error);
    }
})

// **************** Payment ***********************
const Razorpay = require('razorpay');
const Order = require("../model/Order")

router.get("/payment", (req, resp) => {
    const amt = Number(req.query.amt);

    var instance = new Razorpay({ key_id: 'rzp_test_WOONFY9u511Byr', key_secret: 't9ROVnSqZbzNZr59d3KLWzJO' })

    var options = {
        amount: amt * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    instance.orders.create(options, function (err, order) {
        resp.send(order)
    });
})

// **************** Order ***********************


const nodemailer = require("nodemailer")

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'baldaniyaashok153@gmail.com',
        pass: 'bnrwmbscwphxsdcd'
    }
});


router.get("/order", auth, async (req, resp) => {
    const pid = req.query.pid
    const uid = req.user
    const cartProduct = await Cart.find({ uid: uid._id })
    var prod = [];
    for (let i = 0; i < cartProduct.length; i++) {
        prod[i] = {
            pid: cartProduct[i].pid,
            qty: cartProduct[i].qty
        }
    }
    try {
        const data = new Order({
            pid: pid,
            uid: uid._id,
            product: prod
        })

        await data.save()

        var msg = {
            from: 'baldaniyaashok153@gmail.com',
            to: 'vaibhavmathukiya123@gmail.com',
            subject: 'Test',
            html: "order.hbs"

        };

        transporter.sendMail(msg, function (error, info) {
            if (error) {
                console.log(error);
                return
            }
            resp.send("order successfully.....")
        });


    } catch (error) {
        console.log(error);
    }
})

module.exports = router