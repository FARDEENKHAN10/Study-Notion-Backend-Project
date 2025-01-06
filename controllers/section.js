const Course=require("../models/course");
const Section=require('../models/section');
const SubSection=require('../models/SubSection');

// createsection handler
exports.createSection=async (req,res)=>{
    try{
        // fetch data
        const {sectionName,courseId}=req.body;

        //validation
        if(!sectionName||!courseId){
            return res.status(401).json({
                success:false,
                message:'Properties are missing',
            });
        } 

        // create entry in db
        const newSection=await Section.create({sectionName});

        // update course with section object id
        const updatedCourseDetails=await Course.findByIdAndUpdate(courseId,{$push:{courseContent:newSection._id,}},{new:true});

        // return respose
        return res.status(200).json({
            success:true,
            message:'Section create successfully',
            updatedCourseDetails,
        });

    }catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:'unable to create section',
        });
    }
}

// updatesection handler
exports.updateSection=async (req,res)=>{
    try{
        // data fetch
        const {sectionName,sectionId}=req.body;

        // validation
        if(!sectionName||!sectionId){
            return res.status(401).json({
                success:false,
                message:'Properties are missing',
            });
        }

        // update
        const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        // response
        return res.status(200).json({
            success:true,
            message:'section update successfully',
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'unable to update section,please try again',
            error:error.message,
        });
    }
}

// deletesectionhandler
exports.deleteSection = async (req, res) => {
    try {
      const { sectionId, courseId } = req.body;
      await Course.findByIdAndUpdate(courseId, {
        $pull: {
          courseContent: sectionId,
        },
      });
      const section = await Section.findById(sectionId);
      console.log(sectionId, courseId);
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "Section not Found",
        });
      }
  
      //delete sub section
      await SubSection.deleteMany({ _id: { $in: section.subSection } });
  
      await Section.findByIdAndDelete(sectionId);
  
      //find the updated course and return
      const course = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();
  
      res.status(200).json({
        success: true,
        message: "Section deleted",
        data: course,
      });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };