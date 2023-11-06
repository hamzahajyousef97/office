const util = require("util");
const multer = require("multer");
const maxSize = 5 * 1024 * 1024;
const fs = require("fs");

let storage = multer.diskStorage({
   destination: (req, file, cb) => {
      const routeLength = req.baseUrl.length;
      const route = req.baseUrl.slice(1, routeLength);
      const path = `./public/images/${route}`;
      fs.mkdirSync(path, { recursive: true });
      cb(null, path);
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()} - ${file.originalname}`);
   },
});

const imageFileFilter = (req, file, cb) => {
   if (req.params.filter == "only-images") {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/)) {
         var err = new Error("You can upload only image files");
         err.status = 500;
         err.code = "ONLY_IMAGE_FILES";
         return cb(err, false);
      }
      cb(null, true);
   } else if (req.params.filter == "all-files") {
      cb(null, true);
   }
};

let uploadFile = multer({
   storage: storage,
   limits: { fileSize: maxSize },
   fileFilter: imageFileFilter,
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
