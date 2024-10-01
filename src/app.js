const mongoose = require("mongoose")
const express = require("express")
const app = express()
const path = require("path")
const bodyparser = require("body-parser")
const cookieparser = require('cookie-parser')
const dotenv = require("dotenv")
dotenv.config()
const hbs = require("hbs")

const PORT = process.env.PORT
const dburl = process.env.dburl



mongoose.connect(dburl).then(() => {
    console.log("DB connected...!!!")
}).catch(err => {
    console.log(err);
})

const viewpath = path.join(__dirname, "../templates/views")
app.set("view engine", "hbs")
app.set("views", viewpath)

app.use(cookieparser())
app.use(bodyparser.urlencoded({ extended: false }))

const publicpath = path.join(__dirname, "../public")
app.use(express.static(publicpath))

const partialpath = path.join(__dirname, "../templates/partials")
hbs.registerPartials(partialpath)

const adminrouter = require("../router/adminrouter")
app.use("/", adminrouter)

const userrouter = require("../router/userrouter")
app.use("/", userrouter)


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})

