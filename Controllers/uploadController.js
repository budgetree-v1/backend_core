const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const { failedResponse, successResponse, noAccess } = require("../Configs");
const db = require("../Models");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
const uploadMulti = multer({ storage }).fields([
  { name: "file1", maxCount: 1 },
  { name: "file2", maxCount: 1 },
]);

module.exports = {
  upload,
  uploadMulti,
  uploadExcel: async (req, res) => {
    try {
      const { id } = req.token;
      const user = await db.User.findById(id);
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const formatted = data.map(row => ({
        ...row,
        user: id,
      }));

      await db.Transaction.insertMany(formatted);

      fs.unlinkSync(filePath);

      res.send({
        ...successResponse,
        message: "Excel data uploaded successfully!",
        result: { inserted: formatted.length },
      });
    } catch (error) {
      console.error(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to upload Excel data.",
      });
    }
  },
};
