const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Your name!'],
    },
    email:{
        type: String,
        required: [true, "Please Enter your email ID"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role:{
        type: String,
        enum: ['user','guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate:{
            validator: function(el){
                return el === this.password;
            },
            message: "Passwords are not same"
        }
    },
    passwordChangedAt: Date,
    PasswordResetToken: String,
    PasswordResetExpires: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
    
    // passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
    //Only run this function if password was modified
    if(!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 2);

    //Delete the passwordConfirm field
    // this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next){
    //this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedTimeStamp;
    }
    
    //FALSE MEANS NOT CHANGED
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

   this.PasswordResetToken = crypto.createHash('sha256')
   .update(resetToken)
   .digest('hex');  // "crypto is a default package of Nodejs"
    // console.log('work 3');
    
    // console.log({resetToken}, this.PasswordResetToken);

   this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;

   return resetToken;
}

const User = mongoose.model('User', userSchema);                      // "sha356 is an alogorithm"

module.exports = User;