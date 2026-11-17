const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    legacyId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    calories: {
        type: Number,
        required: true
    },
    serving: {
        type: String,
        default: ""
    },
    protein: {
        type: String,
        default: ""
    },
    ingredients: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("Food", foodSchema);