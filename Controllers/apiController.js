const db = require("../Models/api");

const errorResponse = {
  apiStatus: false,
  statusCode: 400,
  result: {},
  message: "Went wrong",
};
const response_sucessus = {
  apiStatus: true,
  statusCode: 200,
  result: {},
  message: "",
};
module.exports = {
  create: async (req, res) => {
    try {
      // let crt = {
      //   id: "send-sms",
      //   name: "Send SMS",
      //   description: "Send SMS to multiple recipients with customizable content",
      //   endpoint: "https://api.bulkpe.com/v1/sms/send",
      //   method: "POST",
      //   parameters: [
      //     {
      //       name: "api_key",
      //       type: "string",
      //       description: "Your BulkPe API key for authentication",
      //       required: true,
      //       example: "b8e7c6a5-d4f3-e2c1-b0a9-8d7f6e5c4b3a",
      //     },
      //     {
      //       name: "message",
      //       type: "string",
      //       description: "The content of the SMS to be sent",
      //       required: true,
      //       example: "Your verification code is 123456",
      //     },
      //     {
      //       name: "recipients",
      //       type: "array",
      //       description: "Array of phone numbers to send the SMS to",
      //       required: true,
      //       example: ["9198765432", "9187654321"],
      //     },
      //     {
      //       name: "sender_id",
      //       type: "string",
      //       description: "Sender ID to be displayed to recipients",
      //       required: true,
      //       example: "BULKPE",
      //     },
      //     {
      //       name: "schedule_time",
      //       type: "datetime",
      //       description: "Schedule the SMS to be sent at a specific time (ISO format)",
      //       required: false,
      //       example: "2023-06-15T14:30:00Z",
      //     },
      //   ],
      //   responses: [
      //     {
      //       status: 200,
      //       description: "SMS sent successfully",
      //       example: '{ "success": true, "message_id": "msg_1234567890", "credits_used": 2, "remaining_credits": 998 }',
      //     },
      //     {
      //       status: 400,
      //       description: "Invalid parameters",
      //       example: '{ "success": false, "error": "Invalid recipients format" }',
      //     },
      //     {
      //       status: 401,
      //       description: "Authentication failed",
      //       example: '{ "success": false, "error": "Invalid API key" }',
      //     },
      //   ],
      //   exampleResponse: '{ "success": true, "message_id": "msg_1234567890", "credits_used": 2, "remaining_credits": 998 }',
      //   examples: {
      //     curl: 'curl -X POST https://api.bulkpe.com/v1/sms/send -H "Content-Type: application/json" -d \'{ "api_key": "b8e7c6a5-d4f3-e2c1-b0a9-8d7f6e5c4b3a", "message": "Your verification code is 123456", "recipients": ["9198765432", "9187654321"], "sender_id": "BULKPE" }\'',
      //     javascript: "fetch('https://api.bulkpe.com/v1/sms/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: '...', message: '...', recipients: ['...'], sender_id: '...' }) })",
      //     python: "import requests\nrequests.post(...)",
      //     php: "<?php $data = [...]; ?>",
      //     java: "// Java example code here",
      //   },
      // };
      let aa = await db.create(req.body);
      return res.send({ ...response_sucessus, data: aa });
    } catch (error) {
      console.log(error);
      return res.send({ ...errorResponse, message: error });
    }
  },
  update: async (req, res) => {
    try {
      let aa = await db.updateOne({ id: req.body.id }, req.body);
      return res.send({ ...response_sucessus, data: aa });
    } catch (error) {
      console.log(error);
      return res.send({ ...errorResponse, message: error });
    }
  },
  delete: async (req, res) => {
    try {
      console.log(req.body.id);

      let aa = await db.deleteOne({ id: req.body.id });
      return res.send({ ...response_sucessus, data: aa });
    } catch (error) {
      console.log(error);
      return res.send({ ...errorResponse, message: error });
    }
  },
  list: async (req, res) => {
    try {
      let aa = await db.find();
      return res.send({ ...response_sucessus, data: aa });
    } catch (error) {
      console.log(error);
      return res.send({ ...errorResponse, message: error });
    }
  },
};
