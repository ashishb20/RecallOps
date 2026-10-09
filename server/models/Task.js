import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true,
        maxLength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [1000, "Description cannot exceed 1000 characters"]
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewStage: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 3],
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastReviewedAt: {
        type: Date,
        default: Date.now
    },
    nextReviewDate: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;