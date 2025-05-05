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
  // cashfreeBase: process.env.ENVMODE == "dev" ? "https://sandbox.cashfree.com" : "",
  cashfreeBase: "https://sandbox.cashfree.com/payout",

  cashfreeClientId: "CF277745D0B59I607N6S73DQ2FTG",
  cashfreeClientSecret:
    "cfsk_ma_test_281a46e6cbd3e943282ba58a77d5f14d_f1b3d3a2",
};
