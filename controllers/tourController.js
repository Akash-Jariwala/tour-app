// 1. ROUTE HADELERS
// const { EDESTADDRREQ } = require('constants');
const multer =  require('multer');
const sharp = require('sharp');     //refer: https://www.npmjs.com/package/sharp
const Tour = require(`./../models/tourModel`);
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require('./handlerFactory');


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

// a) When there is only 1 image to upload:
// upload.single('image');

// b) When there r many image with same fields then:
// upload.array('images', 3);

// c) When there r multiple images with diff. fields then: use upload.fields() 
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async(req, res, next) => {

  if( !req.files.imageCover || !req.files.images ) return next();

  // 1)  cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)      //refer: https://sharp.pixelplumbing.com/api-resize
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`);
  
  //  2) Images 
  req.body.images = [];
  await Promise.all(req.files.images.map(async(file, i) => {
    
    const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

    await sharp(file.buffer)      //refer: https://sharp.pixelplumbing.com/api-resize
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
  }));
``
  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.fields = 'name, price, ratingAverage, summary, difficulty';
  next();
};

// const router = require('../routes/userRoutes');

// const tours = JSON.parse(                    // only for testing purpose//
//     fs.readFileSync(`./dev-data/data/tours-simple.json`)
// );

// ----- Understanding of middleware work-----//
// exports.checkId = (req, res, next, val) => {  //Middleware function
//     console.log(`This is id: ${val}`);

//     if (req.params.id *1 > tours.length) {  //'req.params' contains route parameters in URL//
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid Id'
//         });

//     }
//     next();
// }
// --------------------- //

// to validate body, if it contain "name", "price", furthour it will done by mongoose//
// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400). json({
//             status: "fail",
//             message: 'Messing Name or Price'
//         })
//     }
//     next();
// }

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//     //BUILD QUERY
//     // //1A) FILTERING
//     // const queryObj = {...req.query};
//     // const excludedFields = ['page', 'sort', 'limit','fields'];
//     // excludedFields.forEach(el => delete queryObj[el]); 
    
//     // //1B) ADVANCE FILTERING
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//     // console.log(JSON.parse(queryStr));
    
//     // // { durattion: { gte: '5' }, difficulty: 'easy' }
//     // let query = Tour.find(JSON.parse(queryStr));

//     // // 2) Sorting
//     // if(req.query.sort){
//     //   const sortBy = req.query.sort.split(',').join(' ');
//     //   query = query.sort(sortBy);  // Sorting will perform by mangoose using "sort" property
//     // }
//     // else{
//     //   query = query.sort('-createdAt');
//     // }
//     // const query = Tour.find(queryObj);
    

//     // // 3) Field Limitimg
//     // if(req.query.fields){
//     //   const fields = req.query.fields.split(',').join(' ');
//     //   query = query.select(fields);
//     // }
//     // else{
//     //   query = query.select('-__v');
//     // }
    
//     // // 4) Pagination
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 100;
//     // const skip = (page-1) * limit;
    
//     // query = query.skip(skip).limit(limit);
      
//     //  if(req.query.page){
//     //     const numTours = await Tour.countDocuments();
//     //     if(skip >= numTours) throw new Error('This page does not exists');
//     //   }
      
//       //EXECUTE QUERY          // This statement should be placed at last to make fruitfull changes in APi filtering
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const tours = await features.query;
//     // 2 ways to write queries for DB: 1: Using Mongoose Object, 2: Using Mongoose Queries
    
//     // 1. Using mongoose Object
//     // const tours = await Tour.find(queryObj);


//     //2. USING mongoose METHODS
//     // const tours = await Tour.find()
//     // .where('duration')
//     // .equals(5)
//     // .where('difficulty')
//     // .equals('easy');


//     // console.log(req.requestTime);
    
//     //SEND RESPONSE
//     res.status(200).json({
//       status: "success",
//       // requestedAt: req.requestTime,
//       results: tours.length, //note: prettier forametor will append comma sign after
//       data: {
//         //saving this file, that comma sign will cause request
//         tours //error, plz. do not save this filw after making making
//       } //any kind of changes..
//     });
// });


exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   // console.log(req.params); //  'req.params' contains route parameters in URL
//     // const id = req.params.id * 1; // because parameter(id) passed in URL will be in forms of string so to convert it into the number, it is require to multiply it with any number..
//     // const tour = tours.find(el => el.id === id);

//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     // Above Expaination of '.populate('reviews')': In order to get all the reviews of individual tour according to tour ID (To explore the sourse of this populate, go through tourModel->Virtual Populate, reviewModel->reviewSchema.pre ). 

//     if(!tour){
//       return next(new AppError('No tour found with that ID', 404));
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         tour
//       }
//     });
// });


exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body); //async-await use because "Tour.create().."
//     res.status(201).json({
//       // returns promise
//       status: "success",
//       data: { 
//         tour: newTour
//        }
//     });
  
//   // try {
//   //   // const newId = tours[tours.length - 1].id + 1;
//   //   // const newTour = Object.assign({ id: newId }, req.body); // to merge new object with existing one...//
//   //   // tours.push(newTour);
//   //   // fs.writeFile(`./dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//   //   //     res.status(201).json({
//   //   //         status: "success",
//   //   //         data: {tour: newTour}
//   //   //     });
//   //   // });
//   //   const newTour = await Tour.create(req.body); //async-await use because "Tour.create().."
//   //   res.status(201).json({
//   //     // returns promise
//   //     status: "success",
//   //     data: { tour: newTour },
//   //   });
//   // } catch (err) {
//   //   // indicates validation error
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err
//   //   });
//   // }
// });


exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: false,
//     });

//     if(!tour){
//       return next(new AppError('No tour found with that ID', 404));
//     }

//     res.status(200).json({
//       status: "success",
//       data: { tour },
//     });
// });


exports.deleteTour = factory.deleteOne(Tour); // Below code block was a old controller, though that is also right.
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//      if(!tour){
//       return next(new AppError('No tour found with that ID', 404));
//     }
//     res.status(204).json({
//       status: 'success',
//       data: null
//     });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats =await Tour.aggregate([          //aggregate function return aggregate object.
      {                                           //Similarly Tour.query returns query.
        $match: {
          ratingsAverage: { $gte: 4.5 }
        }
      },
      {
        $group: {
          _id: {$toUpper: '$difficulty'},
          numTours: { $sum: 1 },
          numRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage'},
          avgPrice: { $avg: '$price'},
          minPrice: { $min: '$price'},
          maxPrice: { $max: '$price'}
        }
      },
      {
        $sort: { avgPrice: 1 }
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {$month: '$startDates'},
          numTourStarts: {$sum: 1},
          tours: {$push: '$name'}
        }
      },
      {
        $addFields: {month: '$_id'}
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {numTourStarts: -1}
      },
      {
        $limit: 12
      }


    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
});


// /tours-within/:distance/center/:lating/unit/:unit
// /tours-distance?distance=233&center=-40,45&unit=mi
// /tours-distance=/233/center/-40,45/unit/mi
// /tours-within/:distance/center/:lating/unit/:unit

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
 
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;

  if(!lat || !lng){
    next(new AppError('Please provide latitude and longitude in the format lat, lng.', 400));
  }
    
  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

  
  // console.log(radius);
  res.status(200).json({
    status: "Success",
    results: tours.length, 
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if(!lat || !lng){
    next(new AppError('Please provide latitude and longitude in the format lat, lng.', 400));
  }
  
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier     // place where all the calculated distance will be stored.
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  
  res.status(200).json({
    status: 'Success',
    data: {
      data: distances
    }
  });
});