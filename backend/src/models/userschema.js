import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, unique: true },
  user_name:{
  type: string, 
    required: true,
    unique:true
  },
    graduation_year: { type: Number },
    isverified: { type: Boolean, default: false },
},
    { timestamps: true }
);
export const User = mongoose.model('User', userSchema);