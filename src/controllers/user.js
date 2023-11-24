const {PrismaClient} = require("@prisma/client")
const express = require("express");
const app = express.Router()
const bcrypt = require("bcrypt")
require("dotenv").config()
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient()


app.post('/login', async (req, res) => {
    const secretKey = process.env.JWT_SECRET;
    const expireKey =process.env.JWT_EXPIRE;

    const {email,password} = req.body
    const user = await prisma.user.findFirst({
        where:{
            email:email
        }
    })
    if (!user) {
        return res.status(404).json({
            message:"El usuario ingresado no existe",
        })
     }
    const passwordEncryption = user.password 
    const userId = user.id
     
    const response = await bcrypt.compare(password,passwordEncryption)
    if(!response){
         return res.status(404).json({
            message:"Contraseña no coincide",
        })
    }
    const payload = {
        id: userId,
        email:email,
     };
     const token = await jwt.sign(
        payload,
        secretKey,
        {
            expiresIn:expireKey
        })
       return res.status(200).json({
            message:"Successfull login",
            token:token,
            user:{
                email:user.email,
                id:user.id,
            },
        })
    
})

app.get("/auth",async(req,res)=>{
    const user = await User.findOne({
        where: {
          id: req.id
        }
      });
      const dataUser = user.toJSON();
      const tokenResponse = dataUser.token 
      const token = tokenResponse == null ? false : true
    return res.status(200).json({
        success:true,
        user:dataUser,
        token
    })
})
  


module.exports = app;