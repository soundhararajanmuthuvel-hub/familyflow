const Family = require("../models/family");

exports.createFamily = async (req, res) => {
  try {
    const { familyName, headId } = req.body;

    const family = await Family.create({
      familyName,
      headId,
    });

    res.json(family);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};