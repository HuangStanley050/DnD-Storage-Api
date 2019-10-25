export default {
  deleteFile: async (req, res, next) => {
    const bucket = req.app.get("bucket");
    const db = req.app.get("db");
    const { fileID } = req.body;

    try {
      await bucket.file(fileID).delete();
      await db
        .collection("UploadedFiles")
        .doc(fileID)
        .delete();
      return res.json({ msg: "File deleted" });
    } catch (err) {
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
      const dataRef = await db
        .collection("UploadedFiles")
        .doc(fileId)
        .get();
      const { name } = dataRef.data();
      fileName = name;
    } catch (err) {
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
      return res.json({
        msg: "download link successfully generated",
        link: url
      });
    } catch (err) {
      const error = new Error("unable to download file");
      return next(error);
    }
  },
  getFiles: async (req, res, next) => {
    // return an array of object
    // each object represent a different data type
    // each object has an inner array that contains the name of the files
    const db = req.app.get("db");
    const uploadedFilesRef = db.collection("UploadedFiles");
    const files = [];
    const sortedFiles = [];

    const allFiles = await uploadedFilesRef.get();

    allFiles.docs.map(doc => files.push({ id: doc.id, ...doc.data() }));

    files.forEach(file => {
      const sameFiles = [];

      files.map(fileItem => {
        if (fileItem.fileType === file.fileType) {
          sameFiles.push({ id: fileItem.id, name: fileItem.name });
        }
        return null;
      });

      if (!sortedFiles.find(item => item.type === file.fileType)) {
        sortedFiles.push({ type: file.fileType, files: [...sameFiles] });
      }
    });
    // console.log(sorted_files);
    res.json({ msg: "fetch files route", files: sortedFiles });
  },
  storeFiles: async (req, res, next) => {
    const bucket = req.app.get("bucket");
    const db = req.app.get("db");
    const writeStreamQueue = [];

    let fileSize;
    let fileType;
    let creationTime;
    const creator = "Goblin Slayer";
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
        const databaseResult = await db
          .collection("UploadedFiles")
          .add(fileInfo);
        storageName = `${databaseResult.id}`;
        // console.log(storageName);
        const blob = bucket.file(storageName);
        const writeStreamPromise = new Promise((resolve, reject) => {
          blob
            .createWriteStream()
            .on("finish", () => resolve())
            .on("error", err => reject(new Error("Unable to uploade")))
            .end(file.buffer);
        });
        return writeStreamQueue.push(writeStreamPromise);
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
