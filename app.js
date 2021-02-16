const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const socket = require('socket.io');
const moment = require('moment');
require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

//importing modules
// routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoute');

//models
const Chatroom = require('./models/Chatroom');
const { User } = require('./models/User');

//functions
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const { chatroom_get } = require('./controllers/chatController');
const { read } = require('fs');
const { userInfo } = require('os');

//init
const app = express();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
const io = socket(server);


//middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

//database connection
const mongoURI = process.env.MONGO_URL;

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
  console.log('connected to db');
});

const conn = mongoose.connection;

let gfs;
conn.once('open', function () {
  //init atream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');

  module.exports = { gfs };
});

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads', //match with the collection name
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });



app.post('/saveImage', upload.single('file'), (req, res) => {
  console.log('file received :', req.file);
  res.json(req.file);
});


// socket events
io.on('connection', (socket) => {
  console.log('made socket connection', socket.id);
  // join room initial event 
  socket.on('joinRoom', ({chatroomId}) => {
    socket.join(chatroomId);

    socket.id.toString();
    Chatroom.findById(chatroomId).then((chatroom) => {
      // chatroom.roomMember.push({socketId: socket.id});
      chatroom.roomMember.push(socket.id);
      chatroom.save();
    });
  });

  socket.on('chat', (data) => {
    const {userName, content} = data;
    const chatroomId = data.room;
    io.in(chatroomId).emit('chat', data);
    Chatroom.saveComment(chatroomId, {userName, content});
  });

  // waitng for image sent
  socket.on('file', (data) => {
    const chatroomId = data.room;
    console.log(data);
    io.in(chatroomId).emit('file', data);
  });

  socket.on('disconnect', () => {
    const id = socket.id.toString();
    Chatroom.findOne({ roomMember: id })
    .then(chatroom => {
      const index = chatroom.roomMember.findIndex(member => member === id);
      if(index !== -1){
        chatroom.roomMember.splice(index, 1);
        chatroom.save();
      };
    });
  });

});



//routing
app.get('*', checkUser);

app.get('/', (req, res) => {
  res.render('home');
});

app.use(userRoutes);
app.use(authRoutes);
app.use(chatRoutes);



