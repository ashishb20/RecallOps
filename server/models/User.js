import mongoose from "mongoose";
//  User Schema

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique : true,
    trim: true,
    minLength: [3, "Username must be at least 3 characters long"],
    maxLength:[15, "Username cannot  exceeds 15 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please provide a valid email address"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters long"]
  }
}, {
  timestamps: true
});


// Index for fast queries
userSchema.index({email:1}),
userSchema.index({ username:1});

const user = mongoose.model('User', userSchema);
export default user;