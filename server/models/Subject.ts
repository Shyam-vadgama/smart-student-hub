import { Schema, model, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  faculty: Schema.Types.ObjectId;
  classroom: Schema.Types.ObjectId;
  department: Schema.Types.ObjectId;
  semester: number;
  createdBy: Schema.Types.ObjectId;
}

const SubjectSchema = new Schema({
  name: { type: String, required: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'User' },
  classroom: { type: Schema.Types.ObjectId, ref: 'Classroom' },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true, min: 1, max: 12 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default model<ISubject>('Subject', SubjectSchema);
