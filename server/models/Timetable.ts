import { Schema, model, Document } from 'mongoose';

export interface ITimetable extends Document {
<<<<<<< HEAD
  college: Schema.Types.ObjectId;
  department: Schema.Types.ObjectId;
  semester: number;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
    subject: Schema.Types.ObjectId;
    classroom: Schema.Types.ObjectId;
    faculty: Schema.Types.ObjectId;
  }>;
}

const TimetableSchema = new Schema({
  college: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true },
  schedule: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
      classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
      faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
  ],
}, {
  timestamps: true
});

export default model<ITimetable>('Timetable', TimetableSchema);
=======
  classroom: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  faculty: Schema.Types.ObjectId;
  day: string;
  startTime: string;
  endTime: string;
}

const TimetableSchema = new Schema({
  classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

export default model<ITimetable>('Timetable', TimetableSchema);
>>>>>>> df1c5ed (added github interation)
