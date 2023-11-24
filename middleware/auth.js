const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.verifyToken=(req,res,next)=>{
  

  let authorizationExist = req.header('authorization')
  let token=null;
  if(authorizationExist != undefined){
    let partition =  req.header('authorization').split(' ')
    token = partition[1]; //Authenticate
  }
  jwt.verify(token,process.env.JWT_SECRET,(error,decoded)=>{
    //decoded is the payload
    if(error){
      return res.status(500).json({
        ok:false,
        error
      });
    }else{
      req.id = decoded.id;  
    }
    next();
  });
 
}