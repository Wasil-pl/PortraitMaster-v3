const mongoose = require('mongoose');
const textPattern = new RegExp(/^[a-zA-Z ]*$/);

const photoSchema = new mongoose.Schema({
  title: { type: String, required: true, match: textPattern, maxLength: 25 },
  author: { type: String, required: true, match: textPattern, maxLength: 50 },
  email: { type: String, required: true },
  src: { type: String, required: true },
  votes: { type: Number, required: true },
});

module.exports = mongoose.model('Photo', photoSchema);
