import mongoose, { Schema, Document } from 'mongoose';

export interface IIntegration extends Document {
  college: mongoose.Types.ObjectId;
  name: string;
  type: 'attendance' | 'marks' | 'timetable' | 'student-management' | 'lms' | 'custom';
  baseUrl: string;
  apiKey?: string;
  authType: 'api-key' | 'bearer' | 'basic' | 'oauth';
  authConfig?: {
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  headers?: Record<string, string>;
  endpoints: {
    attendance?: string;
    marks?: string;
    timetable?: string;
    students?: string;
    faculty?: string;
    subjects?: string;
    [key: string]: string | undefined;
  };
  enabled: boolean;
  syncInterval: number; // in minutes
  lastSync?: Date;
  lastSyncStatus?: 'success' | 'failed' | 'partial';
  lastSyncError?: string;
  status: 'active' | 'inactive' | 'error';
  dataMapping?: {
    fieldMappings: Record<string, string>; // external field -> internal field
    transformations?: Record<string, string>; // field -> transformation function name
  };
  webhookSecret?: string;
  webhookUrl?: string;
  syncLogs: Array<{
    timestamp: Date;
    status: 'success' | 'failed' | 'partial';
    recordsSynced: number;
    errors?: string[];
  }>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema: Schema = new Schema(
  {
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: false, // Optional - will use createdBy if not provided
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['attendance', 'marks', 'timetable', 'student-management', 'lms', 'custom'],
      required: true,
    },
    baseUrl: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      select: false, // Don't return by default for security
    },
    authType: {
      type: String,
      enum: ['api-key', 'bearer', 'basic', 'oauth'],
      default: 'api-key',
    },
    authConfig: {
      username: String,
      password: { type: String, select: false },
      clientId: String,
      clientSecret: { type: String, select: false },
      tokenUrl: String,
      accessToken: { type: String, select: false },
      refreshToken: { type: String, select: false },
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
    endpoints: {
      attendance: String,
      marks: String,
      timetable: String,
      students: String,
      faculty: String,
      subjects: String,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    syncInterval: {
      type: Number,
      default: 60, // 60 minutes
      min: 5,
    },
    lastSync: Date,
    lastSyncStatus: {
      type: String,
      enum: ['success', 'failed', 'partial'],
    },
    lastSyncError: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'error'],
      default: 'inactive',
    },
    dataMapping: {
      fieldMappings: {
        type: Map,
        of: String,
        default: {},
      },
      transformations: {
        type: Map,
        of: String,
      },
    },
    webhookSecret: String,
    webhookUrl: String,
    syncLogs: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['success', 'failed', 'partial'],
        },
        recordsSynced: {
          type: Number,
          default: 0,
        },
        errors: [String],
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
IntegrationSchema.index({ college: 1, enabled: 1 });
IntegrationSchema.index({ college: 1, type: 1 });
IntegrationSchema.index({ status: 1 });

// Method to add sync log entry (keep only last 50 entries)
IntegrationSchema.methods.addSyncLog = function(logEntry: any) {
  this.syncLogs.unshift(logEntry);
  if (this.syncLogs.length > 50) {
    this.syncLogs = this.syncLogs.slice(0, 50);
  }
  return this.save();
};

// Method to update sync status
IntegrationSchema.methods.updateSyncStatus = function(
  status: 'success' | 'failed' | 'partial',
  recordsSynced: number = 0,
  errors: string[] = []
) {
  this.lastSync = new Date();
  this.lastSyncStatus = status;
  if (errors.length > 0) {
    this.lastSyncError = errors.join('; ');
  } else {
    this.lastSyncError = undefined;
  }
  
  this.status = status === 'success' ? 'active' : status === 'failed' ? 'error' : 'active';
  
  return this.addSyncLog({
    timestamp: new Date(),
    status,
    recordsSynced,
    errors: errors.length > 0 ? errors : undefined,
  });
};

// Virtual for webhook endpoint
IntegrationSchema.virtual('webhookEndpoint').get(function() {
  return `/api/webhooks/integrations/${this._id}`;
});

// Ensure virtuals are included in JSON
IntegrationSchema.set('toJSON', { virtuals: true });
IntegrationSchema.set('toObject', { virtuals: true });

export default mongoose.model<IIntegration>('Integration', IntegrationSchema);
