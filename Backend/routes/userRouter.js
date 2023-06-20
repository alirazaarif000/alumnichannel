const router = require('express').Router();
const auth = require('../middleware/auth');
const userCtrl = require('../controllers/userCtrl');

router.get('/search', auth, userCtrl.searchUser);
router.get('/users', auth, userCtrl.getUsers);
router.post('/user/resetpassword', auth, userCtrl.resetpassword);
router.get('/user/:id', auth, userCtrl.getUser);
router.post('/user/updatestatus/:id', auth, userCtrl.updateStatus);
router.patch("/user", auth, userCtrl.updateUser);
router.patch("/user/:id/follow", auth, userCtrl.follow);
router.patch("/user/:id/unfollow", auth, userCtrl.unfollow);
router.get("/suggestionsUser", auth, userCtrl.suggestionsUser);

module.exports = router;