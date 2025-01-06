const Category=require("../models/category");

exports.createCategory=async (req,res)=>{
    try{
        // fetch data
        const {name,description}=req.body;

        // validation
        if(!name||!description){
            return res.status(400).json({
                success:true,
                message:'All fields are require',
            });
        }

        // create entry in db
        const categoryDetails=await Category.create({
            name:name,
            description:description,
        });
        console.log("Hi");
        console.log(categoryDetails);

        // return res 
        return res.status(200).json({
            success:true,
            message:'Category created successfully',
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

// create all tag handler function
exports.showAllCategories=async (req,res)=>{
    try{
        const allCategory=await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"All tag returned successfully",
            allCategory,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.categoryPageDetails=async (req,res)=>{
    try{
        const {categoryId}=req.body;

        // get courses for the specified category
        const selectedCategory=await Category.findById(categoryId).populate('course').exec();
        console.log(selectedCategory);

        // handle the case when the category is not found
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:'category is not found',
            });
        }

        // handle the case when there are no course
        console.log(selectedCategory.course.length);
        if(selectedCategory.course.length===0){
            return res.status(404).json({
                success:false,
                message:'no course found for the selected category',
            });
        }

        // get courses for different categorie
        const differentCategories=await Category.find({
            _id:{$ne:categoryId},
        }).populate('course').exec();

        // get top selling courses- hw

        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            }
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'unable to fetch category details',
            message:error.message,
        });
    }
}