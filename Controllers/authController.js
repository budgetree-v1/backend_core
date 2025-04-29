const { successResponse } = require("../Configs");

module.exports = {
  register: async (req, res) => {
    try {
      return res.send({ ...successResponse });
    } catch (error) {}
  },
};
