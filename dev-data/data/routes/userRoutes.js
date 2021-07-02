const express = require("express");
const userController = require(`./../../../controllers/userController`);
const authController = require('./../../../controllers/authController');


const router = express.Router();

// 2. ROUTES

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware.
router.use(authController.protect); //It will protect all the routes that come after this point. Note: place of this middleware matters a lot. if we put this middleware before 'forgotPassword' route, then it will ask to log in to access forgotPassword URL, which doesn' t make any sense. means all the routers after this middleware will ask for authentication.

router.patch('/updateMyPassword',authController.updatePassword);
router.patch('/updateMe',userController.uploadUserPhoto, userController.resizeUserPhoto ,userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
  
  
router.get('/me', userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin')); // only admin will able to access following routes. Means following routes r protected and restricted also


router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


module.exports = router;