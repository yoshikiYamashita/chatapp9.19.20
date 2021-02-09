const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// i havent used it so far , so it might be deleted 
const requireAuth = (req, res, next) => {
  //jwt inside cookies inside req object.
  const token = req.cookies.jwt;
  //check json web token exists & is valified
  if(token){
    jwt.verify(token, 'Yoshi-made', (err, decodedToken) => {
      if(err){
        console.log(err.message);
        res.redirect('/login');
      } else{
        // console.log({decodedToken});
        next();
      }
    })
  }
  else{
    res.redirect('/login');
  }
}


const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if(token) {
    jwt.verify(token, "Yoshi-made", async (err, decodedToken) => {
      if(err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        // console.log({decodedToken});
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        // console.log({user});
        next();
      }

    })
  } else {
    res.locals.user = null;
    next();
  }
}

module.exports = { requireAuth,  checkUser };