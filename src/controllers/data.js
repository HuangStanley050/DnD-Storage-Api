export default {
  deleteFile: async (req, res, next) => {
    const bucket = req.app.get("bucket");
    const db = req.app.get("db");
    const fileID = req.body.fileID;

    try {
      await bucket.file(fileID).delete();
      await db
        .collection("UploadedFiles")
        .doc(fileID)
        .delete();
      res.json({ msg: "File deleted" });
    } catch (err) {
      console.log(err);
      const error = new Error("Unable to delete file");
      return next(error);
    }
  },
  downloadFile: async (req, res, next) => {
    const bucket = req.app.get("bucket");
    const db = req.app.get("db");
    const fileId = req.params.id;
    let fileName = "defaultName";
    let options = {};

    try {
      let dataRef = await db
        .collection("UploadedFiles")
        .doc(fileId)
        .get();
      let { name } = dataRef.data();
      fileName = name;
    } catch (err) {
      console.log(err);
      return next(new Error("Unable to retrieve filename"));
    }
    options = {
      ...options,
      version: "v2", // defaults to 'v2' if missing.
      action: "read",
      expires: Date.now() + 1000 * 60 * 60, // one hour
      promptSaveAs: fileName
    };
    try {
      const [url] = await bucket.file(fileId).getSignedUrl(options);
      res.json({ msg: "download link successfully generated", link: url });
    } catch (err) {
      console.log(err);
      const error = new Error("unable to download file");
      return next(error);
    }
  },
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
      files.push({ id: doc.id, ...doc.data() });
    }

    files.forEach(file => {
      let same_files = [];
      for (let fileItem of files) {
        if (fileItem.fileType === file.fileType) {
          same_files.push({ id: fileItem.id, name: fileItem.name });
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
    let writeStreamQueue = [];
    let database_queue = [];
    let fileSize;
    let fileType;
    let creationTime;
    let creator = "Goblin Slayer";
    let fileInfo;
    let storageName;

    req.files.map(async file => {
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
      try {
        let database_result = await db
          .collection("UploadedFiles")
          .add(fileInfo);
        storageName = `${database_result.id}`;
        //console.log(storageName);
        let blob = bucket.file(storageName);
        const writeStreamPromise = new Promise((resolve, reject) => {
          blob
            .createWriteStream()
            .on("finish", () => resolve())
            .on("error", err => reject("Unable to upload", err))
            .end(file.buffer);
        });
        writeStreamQueue.push(writeStreamPromise);
      } catch (err) {
        const error = new Error("Unable to upload Files");
        return next(error);
      }
    });
    try {
      await Promise.all(writeStreamQueue);
      return res.json({ msg: "Upload successful" });
    } catch (err) {
      return next(new Error("Unable to upload files"));
    }
  }
};
