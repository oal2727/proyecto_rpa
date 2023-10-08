const express = require("express");
const app = express();
const cors = require("cors")
var bodyParser = require('body-parser')
const morgan = require("morgan");
const path = require('path');


require("dotenv").config()
//run app
const directorioBack = path.join(__dirname, '..');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors()) //need define client url
// app.use(bodyParser.json())
app.use(morgan("dev"));

app.use("/api/",require("./controllers/invoice"))

const port =  5000;
if(process.env.NODE_ENV == 'production'){
    app.use(express.static('client'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(directorioBack, 'client', 'index.html'));
    });
}



const server = app.listen(port, () => {
    console.log(`listening in port: ${port}`);
});

module.exports = server;