import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!'; // Must be 32 chars
const ALGORITHM = 'aes-256-cbc';

// Encryption helper functions
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export interface IIntegrationTokens extends Document {
  userId: Schema.Types.ObjectId;
  githubToken?: string;
  githubRefreshToken?: string;
  githubTokenExpiry?: Date;
  vercelToken?: string;
  vercelRefreshToken?: string;
  vercelTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual methods
  getGithubToken(): string | undefined;
  setGithubToken(token: string): void;
  getVercelToken(): string | undefined;
  setVercelToken(token: string): void;
}

const IntegrationTokensSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  githubToken: { type: String },
  githubRefreshToken: { type: String },
  githubTokenExpiry: { type: Date },
  vercelToken: { type: String },
  vercelRefreshToken: { type: String },
  vercelTokenExpiry: { type: Date }
}, { timestamps: true });

// Virtual methods for secure token handling
IntegrationTokensSchema.methods.getGithubToken = function(): string | undefined {
  return this.githubToken ? decrypt(this.githubToken) : undefined;
};

IntegrationTokensSchema.methods.setGithubToken = function(token: string): void {
  this.githubToken = encrypt(token);
};

IntegrationTokensSchema.methods.getVercelToken = function(): string | undefined {
  return this.vercelToken ? decrypt(this.vercelToken) : undefined;
};

IntegrationTokensSchema.methods.setVercelToken = function(token: string): void {
  this.vercelToken = encrypt(token);
};

export default model<IIntegrationTokens>('IntegrationTokens', IntegrationTokensSchema);
