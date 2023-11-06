const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hostingSchema = new Schema(
   {
      domain: {
         type: String,
         required: true,
      },
      domainDate: {
         type: String,
         required: true,
      },
      reNew: {
         type: String,
         required: true,
      },
      price: {
         type: Number,
         required: true,
      },
      hosting: {
         type: String,
         required: true,
      },
      hostingDate: {
         type: String,
         required: true,
      },
      invoiceCreaeted: {
         type: Boolean,
         required: true,
         default: false,
      },
   },
   {
      timestamps: true,
   }
);

const Hosting = mongoose.model("hostings", hostingSchema);

module.exports = Hosting;
