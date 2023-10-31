const express = require("express");
const recruiterController = require("../controllers/recruiterController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router.get("/me", recruiterController.getMe, recruiterController.getRecruiter);

router.patch("/updateMe", recruiterController.updateMe);
router.delete("/deleteMe", recruiterController.deleteMe);

// All the routes after this middleware will be restricted to only "admin"
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(recruiterController.getAllRecruiters)
  .post(recruiterController.createRecruiter);

router
  .route("/:id")
  .get(recruiterController.getRecruiter)
  .patch(recruiterController.updateRecruiter)
  .delete(recruiterController.deleteRecruiter);

module.exports = router;
