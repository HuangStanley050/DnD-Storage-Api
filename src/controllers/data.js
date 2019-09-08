export default {
  storeFiles: (req, res, next) => {
    const bucket = req.app.get("bucket");

    req.files.forEach(async (file, i) => {
      let tempblob = bucket.file(file.originalname);

      let tempblob_stream = tempblob.createWriteStream();

      tempblob_stream.on("error", err => {
        next(err);
      });

      tempblob_stream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        //const publicUrl = `https://storage.googleapis.com/${bucket.name}/${tempblob.name}`;
        //res.status(200).send(publicUrl);
        if (i === req.files.length) {
          res.json({ msg: "Upload files success" });
        }
      });
      tempblob_stream.end(req.files[i].buffer);
    });
  }
};
