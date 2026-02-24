import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/reports");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png/; // ← REGEX (no quotes)

    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.test(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and image files are allowed"), false);
    }
};

const upload = multer({
    storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;