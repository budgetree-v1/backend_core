require("dotenv").config();

module.exports = {
  successResponse: {
    status: true,
    statusCode: 200,
    message: "Success",
    result: {},
  },
  failedResponse: {
    status: false,
    statusCode: 400,
    message: "Failed",
    result: {},
  },

  noAccess: "You dont have access!",

  txnRef: process.env.ENVMODE == "dev" ? "BTREFX00" : "BTREF00",
  currentGst: 18,
  cashfreeBase: process.env.ENVMODE == "dev" ? "https://sandbox.cashfree.com" : "",
  cashfreeClientId: process.env.ENVMODE == "dev" ? "" : "",
  cashfreeClientSecret: process.env.ENVMODE == "dev" ? "" : "",
};
