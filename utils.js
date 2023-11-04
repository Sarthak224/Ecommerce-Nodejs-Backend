const jwt = require('jsonwebtoken');

 
 
 const  verifyDomain = (req,res)=>{
//     if(req.get('host') == "localhost:3000"){
//         return
//     }else{
//         console.log(req)
//         res.status(404).json({error:"Not Authorized for"+req.get('host')})
// }
return;
}


function generateAccessToken(userData,expiresIn) {
    return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn});
  }
  
  
  function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      console.log(err)
  
      if (err) return res.sendStatus(403)
  
      console.log(user);
      req.user = user
  
      next()
    })
  }
  










module.exports = {verifyDomain,generateAccessToken,authenticateToken}