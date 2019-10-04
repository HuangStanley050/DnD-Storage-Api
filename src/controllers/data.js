import uuid from "uuid/v4";
export default {
  downloadFile: async (req, res, next) => {
    const bucket = req.app.get("bucket");
    const db = req.app.get("db");
    let file;
    let query;
    let fileName;
    let downloadLink;
    const options = {
      version: "v2", // defaults to 'v2' if missing.
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 // one hour
    };

    try {
      file = await db
        .collection("UploadedFiles")
        .doc(req.params.id)
        .get();

      fileName = file.data().name;

      const [files] = await bucket.getFiles();

      files.forEach(file => {
        if (file.name.includes(fileName)) {
          query = file.name;
        }
      });
      downloadLink = await bucket.file(query).getSignedUrl(options);
    } catch (err) {
      const error = new Error("Unable to fetch download link");
      error.statusCode = 500;
      return next(error);
    }
    //console.log(downloadLink);
    res.json({ msg: "download successful", link: downloadLink });
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
    console.log(sorted_files);
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
    let storageName;

    // req.files.forEach((file, index) => {
    //   let tempblob = bucket.file(`DnD-${uuid()}-${file.originalname}`);
    //   const newPromise = new Promise((resolve, reject) => {
    //     tempblob
    //       .createWriteStream()
    //       .on("finish", () => {
    //         resolve();
    //       })
    //       .on("error", err => {
    //         reject("upload error", err);
    //       })
    //       .end(req.files[index].buffer);
    //   });
    //   upload_queue.push(newPromise);
    // });

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
        storageName = `${database_result.id}-${file.originalname}`;
        //console.log(storageName);
        let blob = bucket.file(storageName);
        let blobStream = blob.createWriteStream();

        // blobStream.on("error", () => {
        //   console.log(err.response);
        //   next(err);
        // });
        //blobStream.on("finish", () => res.json({ msg: "upload successful" }));
        blobStream.end(file.buffer);
        //database_queue.push(database_result);
        //console.log(database_result.id);
      } catch (err) {
        const error = new Error("Unable to upload Files");
        return next(error);
      }
    });
    res.json({ msg: "Upload successful" });
    // try {
    //   await Promise.all(upload_queue);
    //
    // } catch (err) {
    //   throw err;
    // }
    //console.log(name_files);

    //
    // try {
    //   let result = await Promise.all(database_queue);
    // } catch (err) {
    //   console.log(err);
    //   throw err;
    // }
  }
};
