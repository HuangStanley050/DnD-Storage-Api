export default {
  storeFiles: async (req, res, next) => {
    console.log(req.files);
    res.json({ msg: "Storing file controller" });
  }
};
