
const { Router } = require('express');
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authMiddleware');
const { route } = require('./authRoutes');


const router = Router();

//get
router.get('/getroomlist/:statusOption', chatController.roomlist_get);
router.get('/chatroom/:chatroomId', chatController.room_get);
router.get('/updateroom/:chatroomId', chatController.update_room_get);
router.get('*', chatController.not_found);


//post
router.post('/createchatroom', chatController.create_chatroom_post);
router.post('/addToFavouriteRooms', chatController.add_to_favourite_rooms_post);
router.post('/removeFromFavouriteRooms', chatController.remove_from_favourite_rooms_post);
router.post('/changeName', chatController.change_name);

//delete
router.delete('/deleteChatroom', chatController.delete_chatroom);



module.exports = router;