const express = require("express");
const bodyParser = require("body-parser");
const cors = require("./cors");
const authenticate = require("../authenticate");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
const hosingRouter = express.Router();
hosingRouter.use(bodyParser.json());
const Hosting = require("../models/hosing");

hosingRouter
   .route("/")
   .options(cors.corsWithOptions, (req, res) => {
      res.sendStatus(200);
   })
   .get(cors.cors, (req, res, next) => {
      Hosting.find()
         .then(
            (hosings) => {
               res.statusCode = 200;
               res.setHeader("Content-Type", "application/json");
               res.json(hosings);
            },
            (err) => next(err)
         )
         .catch((err) => next(err));
   })

   .post(cors.corsWithOptions, (req, res, next) => {
      Hosting.create(req.body)
         .then(
            (hosting) => {
               res.statusCode = 200;
               res.setHeader("Content-Type", "application/json");
               res.json(hosting);
            },
            (err) => next(err)
         )
         .catch((err) => next(err));
   });

hosingRouter
   .route("/:hostingId")
   .options(cors.corsWithOptions, (req, res) => {
      res.sendStatus(200);
   })
   .get(cors.cors, (req, res, next) => {
      Hosting.findById(req.params.hostingId)

         .then(
            (hosting) => {
               res.statusCode = 200;
               res.setHeader("Content-Type", "application/json");
               res.json(hosting);
            },
            (err) => next(err)
         )
         .catch((err) => next(err));
   })

   .put(cors.corsWithOptions, (req, res, next) => {
      Hosting.findByIdAndUpdate(
         req.params.hostingId,
         {
            $set: req.body,
         },
         { new: true }
      )
         .then(
            (hosting) => {
               res.statusCode = 200;
               res.setHeader("Content-Type", "application/json");
               res.json(hosting);
            },
            (err) => next(err)
         )
         .catch((err) => next(err));
   })

   .delete(cors.cors, (req, res, next) => {
      Hosting.findByIdAndRemove(req.params.hostingId)
         .then(
            (hosting) => {
               res.statusCode = 200;
               res.setHeader("Content-Type", "application/json");
               res.json({
                  status: "success",
                  message: "hosting deleted Successfully",
               });
            },
            (err) => next(err)
         )
         .catch((err) => next(err));
   });

module.exports = hosingRouter;
