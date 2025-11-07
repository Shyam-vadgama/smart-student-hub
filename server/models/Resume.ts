import mongoose, { Document, Schema } from 'mongoose';

export interface ResumeDocument extends Document {
  user: mongoose.Types.ObjectId;
  template: number;
  data: any;
  // Public portfolio approval fields
  approvalStatus: 'not_requested' | 'pending' | 'approved' | 'rejected';
  approvalRequest?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  isPubliclyVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<ResumeDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  template: { type: Number, enum: [1, 2, 3], required: true },
  data: { type: Schema.Types.Mixed, required: true },
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
}, { timestamps: true });

export default mongoose.model<ResumeDocument>('Resume', resumeSchema);


