const { failedResponse, successResponse, noAccess } = require("../Configs");
const db = require("../Models");
const QRCode = require("qrcode");

module.exports = {
  generateQR: async (req, res) => {
    try {
      const qrDataURL = await QRCode.toDataURL(link);

      // Send an HTML page showing the QR code and link
      res.send(`
      <html>
        <body style="text-align:center; font-family:Arial">
          <h2>QR Code for: <a href="${link}" target="_blank">${link}</a></h2>
          <img src="${qrDataURL}" alt="QR Code" />
        </body>
      </html>
    `);
      // res.send({ ...successResponse, message: "", result: {} });
    } catch (error) {
      console.log(error);
      res.send({
        ...failedResponse,
        message: error.message || "Failed to access this!",
      });
    }
  },
};
