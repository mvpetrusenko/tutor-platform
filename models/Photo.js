const mongoose = require('mongoose');
const { Schema } = mongoose;

// "photos" collection schema
const photoSchema = new Schema(
    {
        // Explicit "id" field as a primary-style key in addition to Mongo _id
        id: {
            type: String,
            required: true,
            unique: true,
            default: () => new mongoose.Types.ObjectId().toHexString(),
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        courseId: {
            type: String,
            required: true,
            index: true,
        },
        filename: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        uploadDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        collection: 'photos',
    }
);

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;

