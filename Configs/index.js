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
  verificationRef: process.env.ENVMODE == "dev" ? "BTVERX00" : "BTVER00",
  currentGst: 18,
  pennyDropPrice: 1,
  pennyLessPrice: 1,
  // cashfreeBase: process.env.ENVMODE == "dev" ? "https://sandbox.cashfree.com" : "",
  cashfreeBase: "https://sandbox.cashfree.com/",

  cashfreeClientId: process.env.CASHFREE_CLIENT_ID,
  cashfreeClientSecret: process.env.CASHFREE_CLIENT_SECRET,

  easebuzzBase: "https://wire.easebuzz.in",
  easebuzzWireKey: "",
  easebuzzWireSecret: "",

  panLitePrice: 1,
  panPremiumPrice: 1,
  gstinPrice: 1,
  aadhaarPrice: 1,
  ocrVerifyPrice: 1,
  uanPrice: 1,
};
