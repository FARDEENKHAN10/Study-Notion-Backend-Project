const Section=require('../models/section');
const subSection=require('../models/SubSection');
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// createsubsection handler
exports.createSubSection=async (req,res)=>{
    try{
        // fetch data
        const {sectionId,title,timeDuration,description}=req.body;
        const video=req.files.videoFile;

        // validation
        if(!title||!timeDuration||!description||!video||!sectionId){
            return res.status(400).json({
                success:false,
                message:'Propertie are missing',
            })
        }

        // upload video to cloudinary
        const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        // create entry in subsection db
        const subSectionDetails=await subSection.create({title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,});

        // create entry in section
        const updatedSection=await Section.findByIdAndUpdate({_id:sectionId},{$push:{subSection:subSectionDetails._id}},{new:true});

        // return response
        return res.status(200).json({
            success:true,
            message:'subs ection created successfully',
            updatedSection,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'unable to create sub section,please try again',
            error:error.message,
        });
    }
}

// update subsection handler

// delete subsetionhandler