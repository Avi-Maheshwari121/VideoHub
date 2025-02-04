import multer from "multer"


const storage = multer.diskStorage({    //storing the files on the disk storage.. we can also store files on memory storage if we want
    destination: function (req, file, cb) {     //cb stands for callback
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {  
      cb(null, file.originalname)         //we can keep the file name as unique by adding unique prefix/suffix etc.. but here we have uploaded the file with the orginal name
    //  Const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  
  export const upload = multer({ 
    storage, 
}) 