const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const { Model } = require('mongoose');


exports.deleteOne = Model => catchAsync(async (req, res, next) => { //refer: https://mongoosejs.com/docs/api.html#model_Model.findByIdAndDelete
    const doc = await Model.findByIdAndDelete(req.params.id);

     if(!doc){
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
});

exports.updateOne = Model =>  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {  //refer: https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
      new: true,
      runValidators: false,
    });

    if(!doc){
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: "success",
      data: { data: doc },
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body); //.create() takes object as parameter.. passed in req.body"
      res.status(201).json({                  // refer: https://mongoosejs.com/docs/api.html#model_Model.create
        // returns promise
        status: "success",
        data: { 
          data: doc
         }
      });
    
    // try {
    //   // const newId = tours[tours.length - 1].id + 1;
    //   // const newTour = Object.assign({ id: newId }, req.body); // to merge new object with existing one...//
    //   // tours.push(newTour);
    //   // fs.writeFile(`./dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //   //     res.status(201).json({
    //   //         status: "success",
    //   //         data: {tour: newTour}
    //   //     });
    //   // });
    //   const newTour = await Tour.create(req.body); //async-await use because "Tour.create().."
    //   res.status(201).json({
    //     // returns promise
    //     status: "success",
    //     data: { tour: newTour },
    //   });
    // } catch (err) {
    //   // indicates validation error
    //   res.status(400).json({
    //     status: 'fail',
    //     message: err
    //   });
    // }
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {  // coz, we have populate in getTour.
 
    // const id = req.params.id * 1; // because parameter(id) passed in URL will be in forms of string so to convert it into the number, it is require to multiply it with any number..
    // const tour = tours.find(el => el.id === id);
    
    let query = Model.findById(req.params.id);  // refer: https://mongoosejs.com/docs/api.html#model_Model.findById
    // popOptions = popOptions.path;
    // console.log(popOptions);
    
    if(popOptions) query = query.populate(popOptions); // populate will reference to 'review' model. act as join in SQL
    const doc = await query;

    // Above Expaination of '.populate('reviews')': In order to get all the reviews of individual tour according to tour ID (To explore the sourse of this populate, go through tourModel->Virtual Populate, reviewModel->reviewSchema.pre ). 

    if(!doc){
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: "success",
      data: {
       data: doc
      }
    });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {

  // To allow for nested GET reviews on Tour
  
  let filter = {}

  if(req.params.tourId) filter = { tour: req.params.tourId };
    

  //BUILD QUERY
  // //1A) FILTERING
  // const queryObj = {...req.query};
  // const excludedFields = ['page', 'sort', 'limit','fields'];
  // excludedFields.forEach(el => delete queryObj[el]); 
  
  // //1B) ADVANCE FILTERING
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // console.log(JSON.parse(queryStr));
  
  // // { durattion: { gte: '5' }, difficulty: 'easy' }
  // let query = Tour.find(JSON.parse(queryStr));

  // // 2) Sorting
  // if(req.query.sort){
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);  // Sorting will perform by mangoose using "sort" property
  // }
  // else{
  //   query = query.sort('-createdAt');
  // }
  // const query = Tour.find(queryObj);
  

  // // 3) Field Limitimg
  // if(req.query.fields){
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // }
  // else{
  //   query = query.select('-__v');
  // }
  
  // // 4) Pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page-1) * limit;
  
  // query = query.skip(skip).limit(limit);
    
  //  if(req.query.page){
  //     const numTours = await Tour.countDocuments();
  //     if(skip >= numTours) throw new Error('This page does not exists');
  //   }
    

    //EXECUTE QUERY          // This statement should be placed at last to make fruitfull changes in APi filtering
  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

    const doc = await features.query;

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
   
    results: doc.length, 
    data: {
     data: doc
    } 
  });
});

