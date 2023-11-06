const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseURL = "http://localhost:8080/";
const upload = async (req, res) => {
   try {
      await uploadFile(req, res);
      if (req.file == undefined) {
         return res.status(400).send({ message: "Please upload a file!" });
      }
      const routeLength = req.baseUrl.length;
      const route = req.baseUrl.slice(1, routeLength);
      res.status(200).send({
         filename: req.file.filename,
         url: `${baseURL}images/${route}/${req.file.filename}`,
         message: "The file was uploaded successfully",
      });
   } catch (err) {
      if (err.code == "LIMIT_FILE_SIZE") {
         return res.status(500).send({
            message: "The file size is too large and cannot be uploaded",
         });
      } else if (err.code == "ONLY_IMAGE_FILES") {
         return res.status(500).send({
            message: "You can only upload image files",
         });
      } else {
         res.status(500).send({
            message: `Could not upload the file: ${err}`,
         });
      }
   }
};
const getListFiles = (req, res) => {
   const routeLength = req.baseUrl.length;
   const route = req.baseUrl.slice(1, routeLength);
   const directoryPath = `public/images/${route}`;
   fs.readdir(directoryPath, function (err, files) {
      if (err) {
         res.status(500).send({
            message: "Unable to scan files!",
         });
      }
      let fileInfos = [];
      files.forEach((file) => {
         fileInfos.push({
            name: file,
            url: baseURL + `images/${route}/` + file,
         });
      });
      res.status(200).send(fileInfos);
   });
};
const download = (req, res) => {
   const fileName = req.params.name;
   const routeLength = req.baseUrl.length;
   const route = req.baseUrl.slice(1, routeLength);
   const directoryPath = `public/images/${route}/`;
   res.download(directoryPath + fileName, fileName, (err) => {
      if (err) {
         res.status(500).send({
            message: "Could not download the file. " + err,
         });
      }
   });
};
const remove = (req, res) => {
   const fileName = req.params.name;
   const routeLength = req.baseUrl.length;
   const route = req.baseUrl.slice(1, routeLength);
   const directoryPath = `public/images/${route}/`;
   fs.unlink(directoryPath + fileName, (err) => {
      if (err) {
         res.status(500).send({
            error: err,
            message: "The file could not be deleted. ",
         });
      } else {
         res.status(200).send({
            message: "The file has been deleted",
         });
      }
   });
};
const removeFiles = (req, res) => {
   const files = req.body.files;
   var i = files.length;
   const routeLength = req.baseUrl.length;
   const route = req.baseUrl.slice(1, routeLength);
   const directoryPath = `public/images/${route}/`;
   if (files.length > 0) {
      files.forEach((file) => {
         fs.unlink(directoryPath + file.response.filename, (err) => {
            i--;
            if (err) {
               if (i <= 0) {
                  res.status(500).send({
                     message: "The file could not be deleted. " + err,
                  });
               }
               return;
            } else if (i <= 0) {
               res.status(200).send({
                  message: "The file has been deleted",
               });
            }
         });
      });
   } else {
      res.status(200).send({
         message: "There are no file to delete",
      });
   }
};
module.exports = {
   upload,
   getListFiles,
   download,
   remove,
   removeFiles,
};
