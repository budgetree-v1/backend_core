const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const { failedResponse, successResponse, noAccess } = require("../Configs");
const db = require("../Models");
const { processPayout } = require("../Services/Handler/payout");

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

module.exports = {
  upload,

  // Upload Excel and save to MongoDB
  uploadExcel: async (req, res) => {
    try {
      const { id } = req.token;
      const user = await db.User.findById(id);
      if (!user) return res.send({ ...failedResponse, message: noAccess });

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Optional: attach userId or validate fields
      const formatted = data.map((row) => ({
        ...row,
        user: id, // or whatever reference you want
      }));

      await db.Transaction.insertMany(formatted); // change this based on your actual model

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

  // other methods (singlePayout, bulkPayout, etc.) remain unchanged
  // ...
};
