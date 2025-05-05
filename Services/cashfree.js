const axios = require("axios");
const { cashfreeBase, cashfreeClientId, cashfreeClientSecret } = require("../Configs");
const fs = require("fs");

module.exports = {
  singlePayout: async ({ mode = "", amount = "", txnId = "", beneAcc = "", beneIfsc = "", vpa = "" }) => {
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
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  aadhaarSendOtp: async ({ aadhaar = "" }) => {
    try {
      let data = { aadhaar_number: aadhaar };
      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/verification/offline-aadhaar/otp`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data.status == "SUCCESS") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify aadhaar" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  aadhaarVerifyOtp: async ({ ref = "", otp = "" }) => {
    try {
      let data = {
        otp: otp,
        ref_id: ref,
      };
      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/verification/offline-aadhaar/verify`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data.status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify aadhaar" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  panLite: async ({ pan = "", name = "", dob = "", ref = "" }) => {
    try {
      let data = {
        verification_id: ref,
        pan: pan,
        name: name,
        dob: dob, //"1993-06-30"
      };
      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/verification/pan-lite`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data.status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  panPremium: async ({ pan = "", name = "", ref = "" }) => {
    try {
      let data = {
        pan: pan,
        verification_id: ref,
        name: name,
      };
      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/verification/pan/advance`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data.status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  gstin: async ({ gstin = "" }) => {
    try {
      let data = {
        GSTIN: gstin,
        business_name: "",
      };
      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/verification/gstin`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data.valid) {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  pennyDrop: async ({ accNo = "", ifsc = "", name = "", ref = "" }) => {
    try {
      let data = {
        bank_account: accNo,
        ifsc: ifsc,
        name: name,
        user_id: ref,
        phone: "",
      };
      const response = await axios({
        method: "get",
        url: `${cashfreeBase}/verification/bank-account/async`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data.account_status == "RECEIVED") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  pennyDropStatus: async ({ ref = "" }) => {
    try {
      let data = {
        // reference_id: "",
        user_id: ref,
      };
      const response = await axios({
        method: "get",
        url: `${cashfreeBase}/verification/bank-account/bank-account`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        params: data,
      });

      if (response.data.account_status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  pennyLess: async ({ accNo = "", ifsc = "", name = "" }) => {
    try {
      let data = {
        bank_account: accNo,
        ifsc: ifsc,
        name: name,
        phone: "",
      };
      const response = await axios({
        method: "get",
        url: `${cashfreeBase}/verification/bank-account/bank-account/sync`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data.account_status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  bulkPennyDrop: async ({ bankDetails = [], ref = "" }) => {
    try {
      let data = {
        bulk_verification_id: ref,
        entries: bankDetails,
      };

      // {
      //   name: "John Doe",
      //   bank_account: "11020001772",
      //   ifsc: "HDFC0000001",
      // },

      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/verification/bank-account/bulk`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data.status == "RECEIVED") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  bulkPennyDropStatus: async ({ ref = "" }) => {
    try {
      let data = {
        bulk_verification_id: ref,
      };

      const response = await axios({
        method: "get",
        url: `${cashfreeBase}/verification/bank-account/bulk`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        params: data,
      });

      if (response.data?.entries?.lenght() > 0) {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  documentOcr: async ({ ref = "", docType = "", filePath = "" }) => {
    try {
      const formData = new FormData();

      formData.append("verification_id", ref);
      formData.append("document_type", docType);

      const fileStream = fs.createReadStream(filePath);
      formData.append("file", fileStream);

      formData.append("do_verification", docType == "PAN" ? true : false);

      const response = await axios.post(`${cashfreeBase}/verification/bharat-ocr`, formData, {
        headers: {
          ...formData.getHeaders(),
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
      });

      if (response.data?.status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  faceMatch: async ({ ref = "", firstImage = "", secondImage = "" }) => {
    try {
      const formData = new FormData();
      formData.append("verification_id", ref);
      formData.append("first_image", fs.createReadStream(firstImage));
      formData.append("second_image", fs.createReadStream(secondImage));

      const response = await axios.post(`${cashfreeBase}/verification/face-match`, formData, {
        headers: {
          ...formData.getHeaders(),
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
      });

      if (response.data?.status == "SUCCESS") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
  UAN: async ({ uan = "", ref = "" }) => {
    try {
      let data = {
        verification_id: ref,
        uan: uan,
      };

      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/verification/advance-employment`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
        },
        data: data,
      });

      if (response.data?.status == "SUCCESS") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, messgae: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data || error?.response || error };
    }
  },
};
