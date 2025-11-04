import mongoose, { Schema, Document } from 'mongoose';

interface IAdmin extends Document {
  name: string;
  email: string;
  // Add any other fields you need for the admin
}

const AdminSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
