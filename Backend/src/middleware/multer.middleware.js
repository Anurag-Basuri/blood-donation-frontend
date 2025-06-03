import multer from "multer";


const storage = multer.diskStorage({
  // destination: "uploads",
  // filename: (req, file, cb) => {
  //   return cb(null, file.originalname);
  // },
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    //cb is callback
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
  