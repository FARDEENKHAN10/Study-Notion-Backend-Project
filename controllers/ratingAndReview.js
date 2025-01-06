const User=require('../models/user');
const Course=require('../models/course');
const RatingAndReview=require('../models/RatingAndReview');
const { mongoose } = require('mongoose');

// create rating and review handler
exports.createRatingAndReview=async (req,res)=>{
    try{
        // get user id
        const userId=req.body.id;

        // fetch data from body
        const {rating,review,courseId}=req.body;

        // check if user enrolled or not
        const courseDetails=await Course.findOne({_id:courseId,studentsEnrolled:{$elemMatch: {$eq: userId}},});
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in this course',
            });
        }

        // check if user already revuew the course
        const alreadyReviewed=await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        });
        if(alreadyReviewed){
            return res.status(404).json({
                success:false,
                message:'Course is already reviewed by user',
            });
        }

        // create rating and review
        const ratingReview=await RatingAndReview.create({
            rating,review,course:courseId,user:userId,
        });

        // update course with this rating and review
       const updatedCourseDetails= await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingReview,
                }
            },
            {new:true}
        );
        console.log(updatedCourseDetails);

        // return res
        return res.status(200).json({
            success:false,
            message:'Rating and review created successfully',
            ratingReview,
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

// get averagerating
exports.getAverageRatingAndReview=async (req,res)=>{
    try{
        // get course id
        const courseId=req.body.courseId;

        // calculate avg rating
        const result=await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ]);

        // return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            });
        }

        // if no rating and review exist
        return res.status(200).json({
            success:true,
            message:'Average rating is 0, no rating give till now',
            averageRating,
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

// get allratingand review
exports.getAllRatingAndReview=async (req,res)=>{
    try{
        const allRatingAndReviews=await RatingAndReview.find({}).sort({rating:'desc'}).populate({
            path:'user',
            select:'firstName lastName email image',
        }).populate({
            path:'course',
            select:'courseName',
        }).exec();

        return res.status(200).json({
            success:true,
            message:'All reviews fetched successfully',
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}