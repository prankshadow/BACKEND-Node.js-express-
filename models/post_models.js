const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('PostModel', postSchema); //Renamed postSchema to Post Model.