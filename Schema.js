const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    day: String,
    age: String,
    gender: String,
    A: Number,
    B: Number,
    C: Number,
    D: Number,
    E: Number,
    F: Number,
});

module.exports = mongoose.model("Record", recordSchema);
