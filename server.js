const express=require('express');
const app=express();

const userRoutes=require('./routes/user');
const profileRoutes=require('./routes/profile');
const courseRoutes=require('./routes/course');
const paymentRoutes=require('./routes/payment');

const database=require('./config/database');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const {cloudinaryConnect}=require('./config/cloudinary');
const fileUpload=require('express-fileupload');
require('dotenv').config();
const PORT=process.env.PORT||4000;
database.connect();
cloudinaryConnect();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:'http://localhost:3000',
        credentials:true,
    })
);
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:'/tmp',
    })
);

// routes
app.use('/api/v1/auth',userRoutes);
app.use('/api/v1/profile',profileRoutes);
app.use('/api/v1/course',courseRoutes);
app.use('/api/v1/payment',paymentRoutes);

// default routes
app.get('/',(req,res)=>{
    return res.json({
        success:true,
        message:'your server is up and running...',
    });
});

app.listen(PORT,()=>{
    console.log(`App is running at port ${PORT}`);
})