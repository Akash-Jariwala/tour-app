const htmlToText = require('html-to-text');
const pug = require('pug');
const nodemailer = require('nodemailer');
const mailgun = require('mailgun-js');
// const  options  = require('../dev-data/data/routes/tourRoutes');

// module.exports = class Email{
//     constructor(user, url) {
//         this.to = user.email;
//         this.firstName = user.name.split(' ')[0];
//         this.url = url;
//         // this.from = `Akash Jariwala <${process.env.EMAIL_FROM}>`;
//         this.from = `Akash Jariwala <abhijari1972@gmail.com>`;
//     }

//     newTransport() {
//         if( process.env.NODE_ENV === 'production'){
//             return 1;
//         }
        
//         return nodemailer.createTransport({ 
//             host: process.env.EMAIL_HOST,
//             port: process.env.EMAIL_PORT,
//             auth: { 
//                 user: process.env.EMAIL_USERNAME,
//                 pass: process.env.EMAIL_PASSWORD
//              },
//          });
//     }

//       // send the actual mail
//     async send(template, subject) {
//         // 1) render HTMl based on a pug template
//         const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
//             firstName: this.firstName,
//             url: this.url,
//             subject
//         });

//         // 2) Define mail option.
//         const mailOptions = {
//             from: this.from,
//             to: this.to,
//             html,
//             text: htmlToText.fromString(html)
//        };
//        console.log('2');
//        // 3) Create a transport and send email.
//          this.newTransport().sendMail(mailOptions);
//     }
    
//     async sendWelcome(){
//        await this.send('welcome', 'Welcome to the Natours Family!');
//     }

//     async sendPasswordReset() {
//         await this.send('passwordReset', 'Your password reset token (valid for 10 minutes).')
//         // console.log('under sendPassword Return');
//     }
    
// };


// ----------------------------------------------

// // STEP 1
// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD
//     }
// });


// // STEP:2 
// let mailOptions = {
//     from: 'abhijari1972@gmail.com',
//     // to: 'jariwalahemali28@gmail.com',
//     to: 'abhijari1972@gmail.com',
//     subject: 'test mail from node.js',
//     text: 'working'
// };

// // STEP:3
// transporter.sendMail(mailOptions, function(err, data) {
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log('EMail Sent');
//     }
// })

// ---------------------------------------------------------

module.exports = class Email{
    // constructor(url) {
    //     this.to = 'abhijari1972@gmail.com, jariwalahemali28@gmail.com, ';
    //     // this.firstName = user.name.split(' ')[0];
    //     this.url = url;
    //     // this.from = `Akash Jariwala <${process.env.EMAIL_FROM}>`;
    //     this.from = `Akash Jariwala <abhijari1972@gmail.com>`;
    // }

    constructor(url, userEmail) {
        const emailAdderess = JSON.stringify(userEmail)
        // this.to = 'abhijari1972@gmail.com, jariwalahemali28@gmail.com, ';
        this.to = emailAdderess;
        // this.firstName = user.name.split(' ')[0];
        this.url = url;
        // this.from = `Akash Jariwala <${process.env.EMAIL_FROM}>`;
        this.from = `Akash Jariwala <${process.env.EMAIL}>`;
    }

    newTransport() {
        if( process.env.NODE_ENV === 'development'){
            return nodemailer.createTransport({
                service: 'smtp.gmail.com',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });
        }
        
        // return nodemailer.createTransport({ 
        //     host: process.env.EMAIL_HOST,
        //     port: process.env.EMAIL_PORT,
        //     auth: { 
        //         user: process.env.EMAIL_USERNAME,
        //         pass: process.env.EMAIL_PASSWORD
        //      },
        //  });
    }

      // send the actual mail
    async send(template, subject) {
        // 1) render HTMl based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            // firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define mail option.
        const mailOptions = {
            from: this.from,
            to: this.to,
            html,
            text: htmlToText.fromString(html)
       };
       // 3) Create a transport and send email.
         this.newTransport().sendMail(mailOptions);
    }
    
    async sendWelcome(){
       await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for 10 minutes).')
        // console.log('under sendPassword Return');
    }

    async sendPaymentSuccess() {
        await this.send('paymentSuccess', 'Payment Successful')
        // console.log('under sendPassword Return');
    }    
    
};