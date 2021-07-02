/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");
const dotenv = require(`dotenv`);
// const cors = require('cors');

// const { doc } = require("prettier");
// console.log(process.env);

process.on('uncaughtException', err => {
  console.log("UNCAUGHT EXCEPTION! Shutting Doown...")
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require("./app");
// app.use(cors());

dotenv.config({ path: `./config.env` });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
  })
  .then(() => console.log('Connection Successful'));

// 4. START SERVER
const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);

});



// GLOBAL PROMISE REJECTION HANDLER
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhadeled Rejection! Shutting Down...');
  server.close(() => {
    process.exit(1);  //Shows app crash error.
  });
});

