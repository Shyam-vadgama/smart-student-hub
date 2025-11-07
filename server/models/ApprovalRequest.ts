import { Schema, model, Document } from 'mongoose';

export interface IApprovalAction {
  approver: Schema.Types.ObjectId;
  approverRole: 'faculty' | 'hod' | 'principal' | 'shiksan_mantri';
  action: 'approved' | 'rejected' | 'pending';
  comments?: string;
  actionDate: Date;
}

export interface IStageApproval {
  stageName: string;
  stageOrder: number;
  status: 'pending' | 'approved' | 'rejected';
  requiredRoles: ('faculty' | 'hod' | 'principal' | 'shiksan_mantri')[];
  requireAll: boolean;
  actions: IApprovalAction[];
  completedAt?: Date;
}

export interface IApprovalRequest extends Document {
  student: Schema.Types.ObjectId;
  contentType: 'project' | 'achievement' | 'resume' | 'marks';
  contentId: Schema.Types.ObjectId;
  workflow: Schema.Types.ObjectId;
  currentStage: number;
  overallStatus: 'pending' | 'in_progress' | 'approved' | 'rejected';
  stages: IStageApproval[];
  requestedAt: Date;
  completedAt?: Date;
  college: Schema.Types.ObjectId;
  department: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalActionSchema = new Schema({
  approver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approverRole: { 
    type: String, 
    enum: ['faculty', 'hod', 'principal', 'shiksan_mantri'],
    required: true 
  },
  action: { 
    type: String, 
    enum: ['approved', 'rejected', 'pending'],
    required: true 
  },
  comments: { type: String },
  actionDate: { type: Date, default: Date.now }
}, { _id: false });

const StageApprovalSchema = new Schema({
  stageName: { type: String, required: true },
  stageOrder: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true 
  },
  requiredRoles: [{ 
    type: String, 
    enum: ['faculty', 'hod', 'principal', 'shiksan_mantri'],
    required: true 
  }],
  requireAll: { type: Boolean, default: false },
  actions: [ApprovalActionSchema],
  completedAt: { type: Date }
}, { _id: false });

const ApprovalRequestSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contentType: { 
    type: String, 
    enum: ['project', 'achievement', 'resume', 'marks'],
    required: true 
  },
  contentId: { type: Schema.Types.ObjectId, required: true },
  workflow: { type: Schema.Types.ObjectId, ref: 'ApprovalWorkflow', required: true },
  currentStage: { type: Number, default: 0 },
  overallStatus: { 
    type: String, 
    enum: ['pending', 'in_progress', 'approved', 'rejected'],
    default: 'pending',
    required: true 
  },
  stages: [StageApprovalSchema],
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  college: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
}, { timestamps: true });

// Indexes for efficient querying
ApprovalRequestSchema.index({ student: 1, contentType: 1, overallStatus: 1 });
ApprovalRequestSchema.index({ college: 1, department: 1, overallStatus: 1 });
ApprovalRequestSchema.index({ 'stages.status': 1 });
ApprovalRequestSchema.index({ contentId: 1, contentType: 1 });

export default model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);
