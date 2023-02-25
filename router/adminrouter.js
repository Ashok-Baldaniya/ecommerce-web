const router = require("express").Router()
const Admin = require("../model/Admin")
const jwt = require("jsonwebtoken")
const adminauth = require("../middleware/aauth")
const Category = require("../model/Category")
const Product = require("../model/Product")
const multer = require('multer')
const User = require("../model/User")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/productimg')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + ".jpg")
    }
})

const upload = multer({ storage: storage })


router.get("/dashboard", adminauth, (req, resp) => {
    resp.render("dashboard")
})

router.get("/aloginpage", (req, resp) => {
    resp.render("adminlogin")
})

router.post("/alogin", async (req, resp) => {
    try {
        const data = await Admin.findOne({ email: req.body.email })
        if (data.password == req.body.password) {
            const token = await jwt.sign({ _id: data._id }, process.env.AKEY)
            resp.cookie("ajwt", token)
            resp.redirect("dashboard")
        }
        else {
            resp.render("adminlogin", { msg: "invalid credential" })
        }
    } catch (error) {
        resp.render("adminlogin", { msg: "invalid credential" })
    }
})

router.get("/alogout", adminauth, (req, resp) => {

    resp.clearCookie("ajwt")
    resp.redirect("aloginpage")

})
// ****************** Product Category **************************8



router.get("/pcategory", async (req, resp) => {
    try {
        const data = await Category.find()
        resp.render("productCategory", { catdata: data })
    } catch (error) {
        console.log(error);
    }
})

router.post("/addcategory", async (req, resp) => {
    try {
        const cat = new Category(req.body)
        await cat.save()
        resp.redirect("pcategory")
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete", async (req, resp) => {
    const id = req.query.did
    try {
        await Category.findByIdAndDelete({ _id: id })
        resp.redirect("pcategory")
    } catch (error) {
        console.log(error);
    }
})


// *************************** Product *******************


router.get("/product", async (req, resp) => {
    try {
        const prod = await Product.find()
        const cat = await Category.find()
        resp.render("product", { cdata: cat, pdata: prod })
    } catch (error) {
        console.log(error);
    }
})

router.post("/addproduct", upload.single("file"), async (req, resp) => {
    try {
        const data = new Product({
            cid: req.body.cid,
            pname: req.body.pname,
            price: req.body.price,
            qty: req.body.qty,
            img: req.file.filename
        })
        await data.save()
        resp.redirect("product")
    } catch (error) {
        console.log(error);
    }
})

router.get("/deleteprod", async (req, resp) => {
    const id = req.query.did
    try {
        await Product.findByIdAndDelete({ _id: id })
        resp.redirect("product")
    } catch (error) {
        console.log(error);
    }
})

router.get("/updatepropage", async (req, resp) => {
    const upid = req.query.uid
    try {
        const data = await Product.find({ _id: upid })
        const catd = await Category.find()
        resp.render("updateProduct", { updata: data, cdata: catd })
    } catch (error) {
        console.log(error);
    }

})

router.post("/updateproduct", upload.single("file"), async (req, resp) => {
    const upddata = req.query.id
    try {
        const data = await Product.findByIdAndUpdate({ _id: upddata }, {
            cid: req.body.cid,
            pname: req.body.pname,
            price: req.body.price,
            qty: req.body.qty,
            img: req.file.filename
        })
        resp.redirect("product")
    } catch (error) {
        console.log(error);
    }
})

// *************************** Order Adminside *******************

const Order = require("../model/Order")
const auth = require("../middleware/auth")
const aauth = require("../middleware/aauth")

router.get("/vieworder", async (req, resp) => {
    try {
        const order = await Order.find()

        resp.render("viewOrder", { odata: order })
    } catch (error) {
        console.log(error);
    }
})


router.get("/viewuser", async (req, resp) => {
    try {
        const data = await User.findOne()
        resp.render("userDetail", { udata: data })
    } catch (error) {
        console.log(error);
    }
})
module.exports = router