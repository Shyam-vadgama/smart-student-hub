import { Schema, model, Document } from 'mongoose';

export interface IMarks extends Document {
  student: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  marks: number;
  examType: string; // e.g., 'mid-sem', 'final'
  // Public portfolio approval fields
  approvalStatus: 'not_requested' | 'pending' | 'approved' | 'rejected';
  approvalRequest?: Schema.Types.ObjectId;
  approvedAt?: Date;
  approvedBy?: Schema.Types.ObjectId;
  isPubliclyVisible: boolean;
}

const MarksSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  marks: { type: Number, required: true },
  examType: { type: String, required: true },
  // Public portfolio approval fields
  approvalStatus: { 
    type: String, 
    enum: ['not_requested', 'pending', 'approved', 'rejected'],
    default: 'not_requested'
  },
  approvalRequest: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' },
  approvedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isPubliclyVisible: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default model<IMarks>('Marks', MarksSchema);
