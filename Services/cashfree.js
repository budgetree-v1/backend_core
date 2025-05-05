const axios = require("axios");
const {
  cashfreeBase,
  cashfreeClientId,
  cashfreeClientSecret,
} = require("../Configs");
const generateSignature = require("../utils/helper");

module.exports = {
  //DELETE BENEFICIARY
  deleteBeneficiary: async ({ beneficiary_id = "" }) => {
    try {
      const response = await axios({
        method: "delete",
        url: `${cashfreeBase}/payout/beneficiary`,
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
  //GET BENEFICIARY
  getBeneficiary: async (
    beneficiary_id = "",
    bank_account_number = "",
    bank_ifsc = ""
  ) => {
    try {
      const signature = generateSignature(
        cashfreeClientId,
        "./accountId_283823_public_key.pem"
      );
      const response = await axios({
        method: "get",
        url: `${cashfreeBase}/beneficiary`,
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2024-01-01",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
          "X-Cf-Signature": signature,
        },
        params: {
          beneficiary_id,
          bank_ifsc,
          bank_account_number,
        },
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

  //CREATE BENEFICIARY
  createBeneficiary: async ({
    uid = "",
    beneficiary_name = "",
    bank_account_number = " ",
    bank_ifsc = "",
    vpa = "",
    beneficiary_email = "",
    beneficiary_phone = "",
    beneficiary_country_code = "",
    beneficiary_address = "",
    beneficiary_city = "",
    beneficiary_state = "",
    beneficiary_postal_code = "",
  }) => {
    try {
      const beneficiary_id = `CASH_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}`;
      let data = {
        beneficiary_id: beneficiary_id,
        beneficiary_name: beneficiary_name,
        beneficiary_instrument_details: {
          bank_account_number: bank_account_number,
          bank_ifsc: bank_ifsc,
          vpa: vpa,
        },
        beneficiary_contact_details: {
          beneficiary_email: beneficiary_email,
          beneficiary_phone: beneficiary_phone,
          beneficiary_country_code: beneficiary_country_code,
          beneficiary_address: beneficiary_address,
          beneficiary_city: beneficiary_city,
          beneficiary_state: beneficiary_state,
          beneficiary_postal_code: beneficiary_postal_code,
        },
      };
      const signature = generateSignature(
        cashfreeClientId,
        "./accountId_283823_public_key.pem"
      );
      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/beneficiary`,
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2024-01-01",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      // console.log("data", response);
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
          beneficiary_name: "Rajat Verma",
          beneficiary_instrument_details: {
            bank_account_number: beneAcc,
            bank_ifsc: beneIfsc,
            vpa: vpa,
          },
        },
      };
      const signature = generateSignature(
        cashfreeClientId,
        "./accountId_283823_public_key.pem"
      );

      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/transfers`,
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2024-01-01",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
          "X-Cf-Signature": signature,
        },
        data: data,
      });
      console.log("repsone", response);
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
