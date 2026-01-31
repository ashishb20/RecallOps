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
    //  Reference to user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    //  Review tracking fields
    reviewStage: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 3],
        /*  Review Stage:
            0 = New task ( review in 1 day)
            1 = After first review ( review in 4 days)
            2 = After second review ( review in 7 days)
            3 = Completed ( review in 30 days)
        */
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastReviewedAt: {
        type: Date,
        default: Date.now()

    },
    nextReviewDate: {
        type: Date,
        required: true,
        default: function() {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0,0,0,0);
            return tomorrow;
        }
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true

});

// Indexes for efficient querying
taskSchema.index({ user: 1, nextReviewDate: 1 });
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ nextReviewDate: 1 });

//  Calculate next review date based on current stage 
taskSchema.methods.calculateNextReview = function() {
    const now = new Date();
    now.setHours(0,0,0,0);

    switch(this.reviewStage) {
        case 0 : 
            now.setDate(now.getDate() + 1); // 1 day
            break;
        case 1 :
            now.getDate() + 4; // 4 days
            break;
        case 2: 
            now.setDate(now.getDate() + 7); // 7 days
            break;
        case 3 : 
            this.completed = true;;
            return null;
        default:
            now.setDate(now.getDate() + 1);
    }
    return now ;
}
//  Mark task as reviewed

taskSchema.methods.markAsReviewed = function() {
    this.reviewCount += 1 ;
    this.lastReviewedAt = new Date();

    this.reviewStage += 1;

    if(this.reviewStage >= 1) {
        this.completed = true;
        this.nextReviewDate = null;
    } else {
        this.nextReviewDate = this.calculateNextReview();
    }

    return this.save();
};

const Task = mongoose.model('Task', taskSchema);

export default Task;