import mongoose, { Document, Schema } from 'mongoose';
import { User } from '@shared/schema';

export interface UserDocument extends Omit<User, '_id'>, Document {
  semester?: number;
}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'hod', 'principal', 'shiksan_mantri'],
    default: 'student',
    required: true
  },
  department: {
<<<<<<< HEAD
    type: String,
    trim: true
=======
    type: Schema.Types.ObjectId,
    ref: 'Department'
>>>>>>> df1c5ed (added github interation)
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  },
  college: {
    type: Schema.Types.ObjectId,
    ref: 'College'
  },
<<<<<<< HEAD
=======
  semester: {
    type: Number,
    min: 1,
    max: 12 // Assuming a maximum of 12 semesters
  },
>>>>>>> df1c5ed (added github interation)
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});



export default mongoose.model<UserDocument>('User', userSchema);
