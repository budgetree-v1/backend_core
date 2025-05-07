const { easebuzzWireKey, easebuzzBase, easebuzzWireSecret } = require("../Configs");
const crypto = require("crypto");

module.exports = {
  singlePayoutEasebuzz: async ({ mode = "", amount = "", txnId = "", beneAcc = "", beneIfsc = "", vpa = "" }) => {
    try {
      let data = {
        key: easebuzzWireKey,
        beneficiary_type: mode == "upi" ? "upi" : "bank_account",
        account_number: beneAcc,
        ifsc: beneIfsc,
        upi_handle: vpa,
        unique_request_number: txnId,
        payment_mode: mode.toUpperCase(),
        amount: amount,
      };

      let signature = `${data.key}|${data.account_number}|${data.ifsc}|${data.upi_handle}|${data.unique_request_number}|${data.amount}|${easebuzzWireSecret}`;
      signature = crypto.createHash("sha512").update(data).digest("hex");

      const response = await axios({
        method: "post",
        url: `${easebuzzBase}/api/v1/quick_transfers/initiate`,
        headers: {
          "Content-Type": "application/json",
          Authorization: signature,
          "WIRE-API-KEY": easebuzzWireKey,
        },
        data: data,
      });
      console.log("repsone", response);
      if (response.data?.success) {
        return { success: true, data: response.data.data.transfer_request || {} };
      } else {
        return { success: false, data: response.data?.data?.transfer_request || response.data || {}, message: "" };
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
