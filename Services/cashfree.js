const axios = require("axios");
const { cashfreeBase, cashfreeClientId, cashfreeClientSecret } = require("../Configs");
const generateSignature = require("../utils/helper");
const fs = require("fs");
const FormData = require("form-data");
const signature = generateSignature(cashfreeClientId, "./Keys/cashfree.pem");

module.exports = {
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
        return { success: false, message: response.data };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error?.response?.data || error?.response || error,
      };
    }
  },
  getBeneficiary: async (beneficiary_id = "", bank_account_number = "", bank_ifsc = "") => {
    try {
      const signature = generateSignature(cashfreeClientId, "../Keys/accountId_283823_public_key.pem");
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
        return { success: false, message: response.data };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error?.response?.data || error?.response || error,
      };
    }
  },
  createBeneficiary: async ({ uid = "", beneficiary_name = "", bank_account_number = " ", bank_ifsc = "", vpa = "", beneficiary_email = "", beneficiary_phone = "", beneficiary_country_code = "", beneficiary_address = "", beneficiary_city = "", beneficiary_state = "", beneficiary_postal_code = "" }) => {
    try {
      const beneficiary_id = `CASH_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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
      const signature = generateSignature(cashfreeClientId, "../Keys/accountId_283823_public_key.pem");
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
        return { success: false, message: response.data };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error?.response?.data || error?.response || error,
      };
    }
  },
  singlePayout: async ({ mode = "", amount = "", txnId = "", beneAcc = "", beneIfsc = "", vpa = "" }) => {
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

      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/payout/transfers`,
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
        return { success: false, message: response.data.message || "failed with partner", data: response.data };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.response?.data || error?.response || error,
      };
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
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      if (response.data.status == "SUCCESS") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify aadhaar" };
      }
    } catch (error) {
      console.log(error?.response?.data || error);
      return { success: false, message: error?.response?.data?.message || error?.response?.data || error?.response || error };
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
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      if (response.data.status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify aadhaar" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data?.message || error?.response?.data || error?.response || error };
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
          "X-Cf-Signature": signature,
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      if (response.data.status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data?.message || error?.response?.data || error?.response || error };
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
          "X-Cf-Signature": signature,
        },
        data: data,
      });
      console.log(response);

      if (response.data && response.data.status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data?.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data?.message || error?.response?.data || error?.response || error };
    }
  },
  gstinVerify: async ({ gstin = "" }) => {
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
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      if (response.data.valid) {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data?.message || error?.response?.data || error?.response || error };
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
        method: "post",
        url: `${cashfreeBase}/verification/bank-account/async`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      if (response.data.account_status == "RECEIVED") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data.message || error?.response?.data || error?.response || error };
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
          "X-Cf-Signature": signature,
        },
        params: data,
      });

      if (response.data.account_status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data.message || error?.response?.data || error?.response || error };
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
      console.log(data);

      const response = await axios({
        method: "post",
        url: `${cashfreeBase}/verification/bank-account/sync`,
        headers: {
          "Content-Type": "application/json",
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      if (response.data.account_status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data.message || error?.response?.data || error?.response || error };
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
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      if (response.data.status == "RECEIVED") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data.message || error?.response?.data || error?.response || error };
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
          "X-Cf-Signature": signature,
        },
        params: data,
      });

      if (response.data?.entries?.lenght() > 0) {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data.message || error?.response?.data || error?.response || error };
    }
  },
  documentOcr: async ({ ref = "", docType = "", filePath = "" }) => {
    try {
      const form = new FormData();

      form.append("verification_id", ref);
      form.append("document_type", docType);

      form.append("file", fs.createReadStream(filePath));

      form.append("do_verification", docType == "PAN" ? "true" : "false");
      const response = await axios.post(`${cashfreeBase}/verification/bharat-ocr`, form, {
        headers: {
          ...form.getHeaders(),
          "x-client-id": cashfreeClientId,
          "x-client-secret": cashfreeClientSecret,
          "X-Cf-Signature": signature,
          "x-api-version": "2024-12-01",
        },
      });

      if (response.data?.status == "VALID") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data.message || error?.response?.data || error?.response || error };
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
          "X-Cf-Signature": signature,
        },
      });

      if (response.data?.status == "SUCCESS") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data.message || error?.response?.data || error?.response || error };
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
          "X-Cf-Signature": signature,
        },
        data: data,
      });

      if (response.data?.status == "SUCCESS") {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data, message: response.data.message || "Failed to verify" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error?.response?.data.message || error?.response?.data || error?.response || error };
    }
  },
};
