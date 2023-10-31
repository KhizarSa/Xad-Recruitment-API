const express = require("express");
const candidateController = require("../controllers/candidateController");

const router = express.Router();

router
  .route("/")
  .get(candidateController.getAllCandidates)
  .post(candidateController.createOneCandidate);

router
  .route("/:id")
  .get(candidateController.getOneCandidate)
  .patch(candidateController.updateOneCandidate)
  .delete(candidateController.deleteOneCandidate);

module.exports = router;
