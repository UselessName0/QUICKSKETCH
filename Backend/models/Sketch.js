const mongoose = require('mongoose');

const sketchSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    word: {
        type: String,
        required: true,
        trim: true
    },
    imageData: {
        type: String,
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Sketch', sketchSchema);