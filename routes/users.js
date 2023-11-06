var express = require("express");
const BodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");
const cors = require("./cors");
var router = express.Router();
router.use(BodyParser.json());

/* GET users listing. */
router.options("*", cors.corsWithOptions, (req, res) => {
   res.sendStatus(200);
});

router.get("/", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
   User.find()
      .then(
         (users) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(users);
         },
         (err) => next(err)
      )
      .catch((err) => next(err));
});

router.get("/:userId", cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
   User.findOne({ _id: req.params.userId })
      .then(
         (user) => {
            if (user) {
               if (JSON.stringify(user._id) == JSON.stringify(req.user._id) || req.user.role == "admin") {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(user);
               } else {
                  var err = new Error("You are not authorized to read the user information");
                  err.status = 403;
                  next(err);
               }
            } else {
               err = new Error("User not found");
               err.status = 404;
               return next(err);
            }
         },
         (err) => next(err)
      )
      .catch((err) => next(err));
});

router.put("/:userId", cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
   const userData = {
      //all fields are required
      name: req.body.name,
      role: req.body.role, // enum: ['user', 'admin']
      phoneNumber: req.body.phoneNumber,
   };
   if (userData.role === "user" || userData.role === "superUser" || userData.role === "dedicatedUser") {
      User.findOne({ _id: req.params.userId })
         .then(
            (user) => {
               if (user) {
                  if (userData) {
                     user.name = req.body.name;
                     user.role = req.body.role; // enum: ['user', 'admin']
                     user.phoneNumber = req.body.phoneNumber;
                     user.save().then(
                        (user) => {
                           User.findById(user._id).then((user) => {
                              res.statusCode = 200;
                              res.setHeader("Content-Type", "application/json");
                              res.json(user);
                           });
                        },
                        (err) => next(err)
                     );
                  } else {
                     console.log("xx");
                  }
               } else {
                  err = new Error("User not found");
                  err.status = 404;
                  return next(err);
               }
            },
            (err) => next(err)
         )
         .catch((err) => next(err));
   } else if (userData.role === "superAdmin") {
      var err = new Error("User Role Is Incorrect");
      err.status = 403;
      return next(err);
   } else {
      var err = new Error("User Role Is Incorrect");
      err.status = 403;
      return next(err);
   }
});

router.delete("/:userId", cors.corsWithOptions, authenticate.verifyUser,  function (req, res, next) {
   if (req.user.role == 'admin'){
      User.findByIdAndRemove(req.params.userId)
         .then(
            (user) => {
               res.statusCode = 200;
               res.setHeader("Content-Type", "application/json");
               res.json({
                  status: "success",
                  messege: `${user.name} Was Deleted Successfuly`,
               });
            },
            (err) => next(err)
         )
         .catch((err) => next(err))
         }
   else if (req.user._id == req.params.userId) {
      User.findByIdAndRemove(req.params.userId)
         .then(
            (user) => {
               res.statusCode = 200;
               res.setHeader("Content-Type", "application/json");
               res.json({
                  status: "success",
                  messege: `${user.name} Was Deleted Successfuly`,
               });
            },
            (err) => next(err)
         )
         .catch((err) => next(err));
   } else {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.json({
         statusCode: 403,
         status: "error",
         message: "You can't delete this user",
      });
   }
});

router.post("/signup", cors.corsWithOptions, (req, res, next) => {
   const user = {
      //all fields are required
      username: req.body.email,
      password: req.body.password,
      name: req.body.name,
      role: "user", // enum: ['user', 'admin']
      phoneNumber: req.body.phoneNumber,
   };
   if (user.role === "user") {
      User.register(new User(user), user.password, (err, user) => {
         if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
         } else {
            user.save((err, user) => {
               if (err) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.json({ err: err });
                  return;
               }
               passport.authenticate("local")(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json({ success: true, status: "Registration Successful!" });
               });
            });
         }
      });
   } else {
      var err = new Error("You Are Not Authorized To Perform This Operations");
      err.status = 403;
      return next(err);
   }
});

router.post("/login", cors.corsWithOptions, (req, res, next) => {
   passport.authenticate("local", (err, user, info) => {
      if (err) {
         return next(err);
      }
      if (!user) {
         res.statusCode = 403;
         res.setHeader("Content-Type", "application/json");
         res.json({ success: false, status: "Login Unseccessful!", err: info });
      } else {
         req.logIn(user, (err) => {
            if (err) {
               res.statusCode = 403;
               res.setHeader("Content-Type", "application/json");
               res.json({ success: false, status: "Login Unseccessful!", err: "Could not log in user!" });
            } else {
               var token = authenticate.getToken({ _id: req.user._id });
               res.statusCode = 200;
               res.setHeader("Content-Type", "application/json");
               res.json({ success: true, status: "Login Seccessful!", accessToken: token, user: user });
            }
         });
      }
   })(req, res, next);
});

router.get("/logout", cors.corsWithOptions, (req, res) => {
   if (req.session) {
      req.session.destroy();
      res.clearCookie("session-id");
      res.redirect("/");
   } else {
      var err = new Error("You are not logged in!");
      err.status = 403;
      next(err);
   }
});

router.get("/checkJWTToken", cors.corsWithOptions, (req, res, next) => {
   passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
         return next(err);
      }
      if (!user) {
         res.statusCode = 401;
         res.setHeader("Content-Type", "application/json");
         return res.json({ status: "JWT invalid!", success: false, err: info });
      } else {
         res.statusCode = 200;
         res.setHeader("Content-Type", "application/json");
         return res.json({ status: "JWT Valid!", success: true, user: user });
      }
   })(req, res);
});

module.exports = router;
