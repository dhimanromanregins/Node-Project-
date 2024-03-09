const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
    boardname: {
        type: String,
        required: true
    }
});

const boards = mongoose.model("Board", boardSchema);

module.exports = boards;
