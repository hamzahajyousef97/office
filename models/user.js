var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema(
   {
      name: {
         type: String,
         required: true,
      },
      phoneNumber: {
         type: String,
         required: true,
      },
      avatar: {
         type: String,
         required: false,
      },
      role:{
         type: String,
         required: true,
         default: "user"
      }
   },
   {
      timestamps: true,
   }
);

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
