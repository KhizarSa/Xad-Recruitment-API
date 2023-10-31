const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Recruiter = require("../models/recruiterModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

const createSendToken = (recruiter, statusCode, req, res) => {
  const token = signToken(recruiter._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  recruiter.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      recruiter,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newRecruiter = await Recruiter.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newRecruiter, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Check if recruiter exist && password is correct
  const recruiter = await Recruiter.findOne({ email }).select("+password");

  if (
    !recruiter ||
    !(await recruiter.correctPassword(password, recruiter.password))
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything is ok, send token to the client
  createSendToken(recruiter, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if recruiter still exists
  const currentRecruiter = await Recruiter.findById(decoded.id);
  if (!currentRecruiter) {
    return next(
      new AppError(
        "The recruiter belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if recruiter changed password after the token was issued
  if (currentRecruiter.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Recruiter recently changed password! Please log in again.",
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.recruiter = currentRecruiter;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.recruiter.role)) {
      return next(
        new AppError("You donot have the permisson to perform this action", 403)
      );
    }

    next();
  };

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get recruiter from collection
  const recruiter = await Recruiter.findById(req.recruiter.id).select(
    "+password"
  );

  // 2) Check if POSTed current password is correct
  if (
    !(await recruiter.correctPassword(
      req.body.passwordCurrent,
      recruiter.password
    ))
  ) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  recruiter.password = req.body.password;
  recruiter.passwordConfirm = req.body.passwordConfirm;
  await recruiter.save();
  // Recruiter.findByIdAndUpdate will NOT work as intended!

  // 4) Log recruiter in, send JWT
  createSendToken(recruiter, 200, req, res);
});
