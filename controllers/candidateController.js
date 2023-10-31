const Candidate = require("../models/candidateModel");
const factory = require("./handlerFactory");
// const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");

exports.getAllCandidates = factory.getAll(Candidate);
exports.getOneCandidate = factory.getOne(Candidate);
exports.createOneCandidate = factory.createOne(Candidate);
exports.updateOneCandidate = factory.updateOne(Candidate);
exports.deleteOneCandidate = factory.deleteOne(Candidate);
