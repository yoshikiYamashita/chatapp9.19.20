
//models
const Chatroom = require('../models/Chatroom');
const { User } = require('../models/User');

//home
module.exports.roomlist_get = async (req, res) => {
  const statusOption = req.params.statusOption;

  let chatrooms;
  try{
    //find chatrooms from db 
    if (statusOption === "active") {
      chatrooms = await Chatroom.find({archive: false});
    } else if (statusOption === "archived") {
      chatrooms = await Chatroom.find({archive: true});
    } else {
      //saved
      chatrooms = await Chatroom.find({idsSavingThisRoom: statusOption});
    }
 
    //find authers name by matching id
    await Promise.all(chatrooms.map( async chatroom => {
      const id = chatroom.auther.authersId;
      const user = await User.findById(id);
      if(user) {
        chatroom.auther.authersName = user.userName;
      } else {
        chatroom.auther.authersName = 'Anonymous';
      }
    }));
    res.status(200).json(chatrooms);
  }
  catch(err){
    console.log(err);
  }
}

module.exports.create_chatroom_post = async (req, res) => {
  const { title, description, userData } = req.body;
  const authersId = userData._id;
  try{
    const chatroom = await Chatroom.create({
      title: title,
      description: description,
      auther:{
        authersId: authersId
      },
    });
    const user = await User.findById(userData._id);
    console.log(user, 'this user was created a new room');
    user.yourRooms.push(chatroom._id);
    user.save();
    res.status(201).json({chatroom});
  }
  catch(err){
    console.log(err);
  }
}

//in a room
module.exports.room_get = (req, res) => {
  const chatroomId = req.params.chatroomId;
  res.render('room', {chatroomId} );
}

module.exports.update_room_get = (req, res) => {
  const id = req.params.chatroomId;
  Chatroom.findById(id)
  .then((result) => {
    res.status(200).json(result);
  })
  .catch(err => console.log(err));
}

module.exports.add_to_favourite_rooms_post = (req, res) => {
  const {userId, chatroomId} = req.body;
  console.log({userId, chatroomId});
  Chatroom.findById(chatroomId).then((chatroom) => {
    if( !chatroom.idsSavingThisRoom.includes(userId) ) {
      chatroom.idsSavingThisRoom.push(userId);
      chatroom.save();
      res.status(201).json({msg: 'successfly saved to favourites'});
    } else {
      console.log('this chatroom has already been saved.');
      res.status(409).json({msg: 'dupulication err'});
    }
  })
}


module.exports.remove_from_favourite_rooms_post = (req, res) => {
  const {userId, chatroomId} = req.body;
  console.log({userId, chatroomId});
  Chatroom.findById(chatroomId).then((chatroom) => {
    const index = chatroom.idsSavingThisRoom.findIndex(id => id === userId);
    if ( !(index === -1) ) { 
      console.log(index, 'correct');
      chatroom.idsSavingThisRoom.splice(index, 1);
      console.log(chatroom.idsSavingThisRoom);
      chatroom.save();
     res.status(201).json({msg: 'this chatroom has successfly removed from your favourite rooms'});
    } else {
      console.log(index, 'false');
    }
  })
}

module.exports.change_name = async (req, res) => {
  const { name, userInfo } = req.body;
  const id = userInfo._id;
  console.log({id});
  console.log(name, userInfo);
  try {
    const user = await User.findById(id);
    user.userName = name;
    await user.save();
    res.status(200).json({msg: 'changed'});
  } catch(err) {
    console.log(err)
    res.status(400).json({msg: err.message});
  }
}


module.exports.delete_chatroom = async (req, res) => {
  const { gfs } = require('../app');
  const {roomId, userId} = req.body;
  console.log({roomId, userId});
  try {
    //find user
    const user = await User.findById(userId);
    const index = user.yourRooms.findIndex(room => String(room) === roomId);
    if (index !== -1) {
      user.yourRooms.splice(index, 1);

      //delete files chatroom contain
      const chatroom = await Chatroom.findById(roomId);
      chatroom.comments.forEach(comment => {
        if(comment.filename) {
          const filename = comment.filename;
          console.log(filename);
          gfs.remove({ filename: filename, root: 'uploads' }, (err, gridStore) => {
            if(err) {
              return res.status(404).json({err: err});
            }
            console.log('file deleted');
          });
        }
      });

      //delete chatroom
      Chatroom.findOneAndDelete({_id: roomId})
      .then(() => {
        user.save();
        res.status(200).json({msg: 'room successfully deleted'});
      })
      .catch((err) => {
        console.log(err);
      })
    } else {
      res.status(400).json({msg: 'sth went wrong'});
    }
  } catch(err) {
    console.log(err);
  }
}

module.exports.not_found = (req, res) => {
  res.render('notFound');
}