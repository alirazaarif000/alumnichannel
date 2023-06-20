const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    alphabets: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    link:{
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

const JobPost = mongoose.model('Job', jobPostSchema);
module.exports = JobPost;
