import uuid from "uuid/v4";
export default {
  getFiles: async (req, res, next) => {
    //return an array of object
    //each object represent a different data type
    //each object has an inner array that contains the name of the files
    const db = req.app.get("db");
    const uploadedFiles_ref = db.collection("UploadedFiles");
    const files = [];
    let sorted_files = [];

    let allFiles = await uploadedFiles_ref.get();

    for (let doc of allFiles.docs) {
      files.push(doc.data());
    }

    files.forEach(file => {
      let same_files = [];
      for (let fileItem of files) {
        if (fileItem.fileType === file.fileType) {
          same_files.push(fileItem.name);
        }
      }
      if (!sorted_files.find(item => item.type === file.fileType)) {
        sorted_files.push({ type: file.fileType, files: [...same_files] });
      }
    });
    //console.log(sorted_files);
    res.json({ msg: "fetch files route", files: sorted_files });
  },
  storeFiles: async (req, res, next) => {
    const bucket = req.app.get("bucket");
    const db = req.app.get("db");
    let upload_queue = [];
    let database_queue = [];
    let fileSize;
    let fileType;
    let creationTime;
    let creator = "Goblin Slayer";
    let fileInfo;

    req.files.forEach((file, index) => {
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

    req.files.forEach(file => {
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
      let database_result = db.collection("UploadedFiles").add(fileInfo);
      database_queue.push(database_result);
    });

    try {
      await Promise.all(upload_queue);
    } catch (err) {
      throw err;
    }

    res.json({ msg: "upload successful" });

    try {
      let result = await Promise.all(database_queue);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
