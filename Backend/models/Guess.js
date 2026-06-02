const mongoose = require('mongoose');

const guessSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sketchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sketch',
        required: true
    },
    attemptsCount: {
        type: Number,
        default: 0,
        max: 10 
    },
    hasWon: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Guess', guessSchema);