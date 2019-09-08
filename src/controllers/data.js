import uuid from "uuid/v4";
export default {
  storeFiles: async (req, res, next) => {
    const bucket = req.app.get("bucket");
    let upload_queue = [];

    let fileSize;
    let fileType;
    let creationTime;
    let creator = "Goblin Slayer";
    let fileInfo;

    req.files.forEach((file, index) => {
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

      let tempblob = bucket.file(`DnD-${uuid()}-${file.originalname}`);
      const newPromise = new Promise((resolve, reject) => {
        tempblob
          .createWriteStream()
          .on("finish", () => {
            resolve();
          })
          .on("error", err => {
            reject("upload error", err);
          })
          .end(req.files[index].buffer);
      });
      upload_queue.push(newPromise);
    });
    try {
      await Promise.all(upload_queue);
    } catch (err) {
      throw err;
    }

    res.json({ msg: "upload successful" });
  }
};
