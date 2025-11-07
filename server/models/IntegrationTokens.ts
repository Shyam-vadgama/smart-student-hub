import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

// Generate a proper 32-byte encryption key
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-me';
  // Create a 32-byte key using SHA-256 hash
  return crypto.createHash('sha256').update(key).digest();
};

const ALGORITHM = 'aes-256-cbc';

// Encryption helper functions
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
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
