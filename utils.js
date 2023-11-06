const jwt = require('jsonwebtoken');
const UserSession = require('./models/UserSession');

 
 
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
  
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
      console.log(err)
  
      if (err) return res.sendStatus(403)
  
      //console.log(user);
      req.user = user
      if(req.body.checkUserSession){
      if(await getUserSession(req.body.email,token)){ 
      next()
      }
      else
      return res.sendStatus(401);
      }
      else
      next()

    })
  }
  



 async function getUserSession(email,token){
  console.log({email,token})
    var resp = await UserSession.find({email,token});

    console.log(resp)
    if(resp.length <= 0){

      return false;
    }
  else
  return true;
  }







module.exports = {verifyDomain,generateAccessToken,authenticateToken}