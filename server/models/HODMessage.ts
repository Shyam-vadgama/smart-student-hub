import { Schema, model, Document } from 'mongoose';

export interface IHODMessage extends Document {
  sender: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  sharedStudents?: Schema.Types.ObjectId[];
  sharedSubjects?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const HODMessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  sharedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  sharedSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
}, {
  timestamps: true,
});

export default model<IHODMessage>('HODMessage', HODMessageSchema);
