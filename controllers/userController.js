
const Chatroom = require('../models/Chatroom');
const { User } = require('../models/User');
const bcrypt = require('bcrypt');

module.exports.user_get = async (req, res) => {
  const id = req.params.userId;
  try {
    const user = await User.findById(id);
    console.log(user, 'user found');

    let yourRooms= [];
    await Promise.all(user.yourRooms.map( async id => {
      const room = await Chatroom.findById(id);
      yourRooms.push(room);
    }));
    
    res.render('user', {user, yourRooms});
    
  } catch(err) {
    console.log(err);
  }
}
module.exports.delete_user = async (req, res) => {
  const {userInfo, password} = req.body
  const email = userInfo.email;
  const pass = userInfo.password;
  const id = userInfo._id;
  try {
    const auth = await bcrypt.compare(password, userInfo.password);
    if(auth) {
      User.findOneAndDelete({_id: id}).then(() => {
        res.json({msg: 'user deleted'});
      })
    }else if(!auth) {
      res.json({msg: "incorrect password"});
    }
  }
  catch(err) {
    console.log(err);
  }
} 