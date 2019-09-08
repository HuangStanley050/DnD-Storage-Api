import uuid from "uuid/v4";
export default {
  storeFiles: (req, res, next) => {
    const bucket = req.app.get("bucket");
    let fileSize;
    let fileType;
    let creationTime;
    let creator = "Goblin Slayer";
    let fileInfo;

    req.files.forEach(async (file, index) => {
      fileSize = file.size;
      fileType = file.mimetype;
      creationTime = Date.now();
      fileInfo = {
        fileType,
        fileSize,
        creationTime,
        creator,
        name: file.originalname
      };
      console.log(fileInfo);
      let tempblob = bucket.file(`DnD-${uuid()}-${file.originalname}`);

      let tempblob_stream = tempblob.createWriteStream();

      tempblob_stream.on("error", err => {
        next(err);
      });

      tempblob_stream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        //const publicUrl = `https://storage.googleapis.com/${bucket.name}/${tempblob.name}`;
        //res.status(200).send(publicUrl);
        if (index + 1 === req.files.length) {
          res.json({ msg: "Upload files success" });
        }
      });
      tempblob_stream.end(req.files[index].buffer);
    });
  }
};
