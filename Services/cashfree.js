const axios = require("axios");
const {
  cashfreeBase,
  cashfreeClientId,
  cashfreeClientSecret,
} = require("../Configs");

module.exports = {
  singlePayout: async ({
    mode = "",
    amount = "",
    txnId = "",
    beneAcc = "",
    beneIfsc = "",
    vpa = "",
  }) => {
    try {
      let data = {
        transfer_id: txnId,
        transfer_amount: amount,
        transfer_mode: mode,
        beneficiary_details: {
          beneficiary_instrument_details: {
            bank_account_number: beneAcc,
            bank_ifsc: beneIfsc,
            vpa: vpa,
          },
        },
      };

      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/payout/transfers`,
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2024-01-01",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, messgae: response.data };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error?.response?.data || error?.response || error,
      };
    }
  },
};
