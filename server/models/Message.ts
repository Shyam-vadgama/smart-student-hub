import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  senderRole: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'file' | 'naac-report' | 'image';
  
  // For file messages
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  
  // For NAAC report sharing
  naacReportId?: mongoose.Types.ObjectId;
  
  // Metadata
  readBy: Array<{
    user: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'naac-report', 'image'],
      default: 'text',
    },
    
    // File fields
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    fileType: {
      type: String,
    },
    
    // NAAC report reference
    naacReportId: {
      type: Schema.Types.ObjectId,
      ref: 'NAACReport',
    },
    
    // Read receipts
    readBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
