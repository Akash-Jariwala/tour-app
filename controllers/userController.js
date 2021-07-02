const multer =  require('multer');
const sharp = require('sharp');     //refer: https://www.npmjs.com/package/sharp
const { Model } = require("mongoose");
const AppError = require("../utils/appError");
const User = require(`./../models/userModel`);
const catchAsync = require("./../utils/catchAsync");
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, res, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    }else{
        cb( new AppError('Not an image! Please upload only image.', 404), false)
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
}); 

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto =catchAsync(async(req, res, next) => {
    if( !req.file ) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

     await sharp(req.file.buffer)      //refer: https://sharp.pixelplumbing.com/api-resize
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`);
        
    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.updateMe = catchAsync(async(req, res, next) => {    //refer: https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate

    // console.log(req.file);

    // 1) crete error if user post password data
    if(req.body.password || req. body.passwordConfirm){
        return next(new AppError('This route is not for password upadates, please use /updatePassword ', 400));
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated.
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) {
        filteredBody.photo = req.file.filename;
    }
    
    // 3) update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user:updatedUser
        }
    });
});

//images r not directly upload to database, we just upload them into our file system nd then in the db we put a link to that image.
  //Refer: https://www.npmjs.com/package/multer

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false
    });

    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;    // coz, inorder to get logged in user data we need to take currently loggedin user id.
    next();
}

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();
 
//     //SEND RESPONSE
//     res.status(200).json({
//       status: "success",
//       results: users.length, 
//       data: {
//         users 
//       } 
//     });

// });

exports.getUser = factory.getOne(User);
// exports.getUser = catchAsync((req, res, next) => {
//     res.status(500).json({
//         status: "error",
//         message: "this route is not yet defined"
//     });
// });

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "this route is not yet defined. Please use /Signup instade"
    });

};

// Do not update password with below route!
exports.updateUser = factory.updateOne(User);
// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: "error",
//         message: "this route is not yet defined"
//     });

// };


exports.deleteUser = factory.deleteOne(User);
// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: "error",
//         message: "this route is not yet defined"
//     });

// };

