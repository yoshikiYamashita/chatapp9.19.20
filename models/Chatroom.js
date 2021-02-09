const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  content: {
    type: String,
  },
  filename: {
    type: String
  },
  sentDate: {
    type: Date,
    default: Date
  }
});

const chatroomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 30,
  },
  auther: {
    authersId: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    authersName: {
      type: String,
    }
  },
  createdDate: {
    type: Date,
    default: Date,
  },
  lastUpdatedDate: {
    type: Date,
    default: Date
  },
  archive: {
    type: Boolean,
    default: false
  },
  roomMember: [String],
  idsSavingThisRoom: [String],
  comments: [commentSchema]
});

chatroomSchema.statics.saveComment = async function(chatroomId, {userName, content, filename}){
  try {
    const chatroom = await this.findById(chatroomId);
    chatroom.comments.push({userName, content, filename});
    chatroom.lastUpdatedDate = Date.now();
    chatroom.save();
    console.log(`comment saved to ${chatroom.title}`, {userName, content, filename});
  } catch(err) {
    console.log(err);
  }
};


const Chatroom = mongoose.model('chatroom', chatroomSchema);

// handling archives
const RoomArchivesHandler = () => {
  Chatroom.find()
  .then((chatrooms) => {
    chatrooms.forEach(chatroom => {
      const now = new Date().getTime();
      const ArchiveIn = 24 * 60 * 60 * 1000 * 7; 
      const ArchivedDate = ( chatroom.lastUpdatedDate.getTime() ) + ArchiveIn;

      if( ArchivedDate < now ) {
        chatroom.archive = true;
        chatroom.save();
        // console.log('this chatroom was moved to archive');
      } else {
        chatroom.archive = false;
        chatroom.save();
        // console.log('this chatroom was moved from archive');
      }
    })
    // console.log('archives handled');
  })
}
RoomArchivesHandler();
const oneday = 24 * 60 * 60 * 1000;
setInterval(RoomArchivesHandler, oneday);

module.exports = Chatroom;