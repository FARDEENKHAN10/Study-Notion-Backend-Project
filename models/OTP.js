const mongoose=require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require("../mail/emailVerificationTemplate");
const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createAt:{
        type:Date,
        default:Date.now(),
        expires:10*50,
    }
});

// function to send mail
async function sendVerificationEmail(email,otp) {
    try{
        const mailResponse= await mailSender(email,"verification email from studyNotion",emailTemplate(otp));
        console.log("email sent successfully : ",mailResponse);
    }
    catch(error){
        console.log("error occured while sending mails ",error);
        throw error;
    }
}

OTPSchema.pre("save", async function (next) {
    try {
        await sendVerificationEmail(this.email, this.otp);
    } catch (error) {
        console.error("Error in pre-save email sending:", error);
    }
    next();
});


module.exports=mongoose.model("OTP",OTPSchema);