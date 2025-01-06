const Course=require("../models/course");
const Category=require("../models/category");
const User=require("../models/user");
const {uploadImageToCloudinary}=require("../utils/imageUploader");

// createcourse handle function
exports.createCourse=async (req,res)=>{
    try{
        // fetch data
        const {courseName,courseDescription, whatYouWillLearn, price, category}=req.body;

        // get thumbnail
        const thumbnail=req.files.thumbnailImage;

        // validation
        if(!courseName||!courseDescription||!whatYouWillLearn||!price||!category||!thumbnail){
            return res.status(400).json({
                success:false,
                message:'All fields are require',
            });
        }

        // check for instructor
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId);
        console.log("instructor details", instructorDetails);
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'instructor details are required',
            });
        }

        // check give tag valid or not
        const categoryDetails=await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:'category details are required',
            });
        }

        // upload image to cloudinay
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        // create an entry for new course
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });

        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        // update the tag schema todo

        // response
        return res.status(200).json({
            success:true,
            message:'course created successfully',
            data:newCourse,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'fail to create course',
            error:error.message,
        });
    }
}

// showallcourse handler
exports.showAllCourses=async (req,res)=>{
    try{
        const allCourses=await Course.find({});
        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'fail to fetch  course data',
            error:error.message,
        });
    }
}

// getcoursedetails
exports.getCourseDetails=async (req,res)=>{
    try{
        // get id
        const {courseId}=req.body;

        // find course details
        const courseDetails=await Course.findOne({
            _id:courseId
        }).populate(
            {
                path:'instructor',
                populate:{
                    path:'additionalDetails',
                },
            }
        ).populate('category').populate('ratingAndReviews').populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        }).exec();

        // validation
        if (!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            });
        }
            
        if (courseDetails.status === "Draft"){
            return res.status(403).json({
                success: false,
                message: `Accessing a draft course is forbidden`,
            });
        }
        return res.status(200).json({
            success: true,
            data: courseDetails,
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'fail to fetch  course details',
            error:error.message,
        });
    }
}