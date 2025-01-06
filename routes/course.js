// Import the required modules
const express = require("express");
const router = express.Router();

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  showAllCourses,
  getCourseDetails
} = require("../controllers/Course");

// Categories Controllers Import
const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category");

// Sections Controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/section");

// Sub-Sections Controllers Import
const {
  createSubSection,
  // updateSubSection,
  // deleteSubSection,
} = require("../controllers/subSection");

// Rating Controllers Import
const {
  createRatingAndReview,
  getAverageRatingAndReview,
  getAllRatingAndReview
} = require("../controllers/ratingAndReview");

// const { updateCourseProgress } = require("../controllers/courseProgress");

// Importing Middlewares
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection);
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);
// Edit Sub Section
// router.post("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete Sub Section
// router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails);
// Get Details for a Specific Courses
router.post("/showAllCourses", auth, showAllCourses);
// Edit Course routes
// router.post("/editCourse", auth, isInstructor, editCourse);
// Get all Courses Under a Specific Instructor
// router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
// Delete a Course
// router.delete("/deleteCourse", deleteCourse);

// router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

// !before in showAllCategories when write "auth" this create the problem status code 401 not found
// router.get("/showAllCategories", showAllCategories);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRatingAndReview", auth, isStudent, createRatingAndReview);
router.get("/getAverageRatingAndReviw", getAverageRatingAndReview);
router.get("/getAllRatingAndReview", getAllRatingAndReview);

module.exports = router;