// application.schema.ts
import mongoose, { Schema } from 'mongoose';

export const ApplicationSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicantDetails: { type: Schema.Types.Mixed },
  files: [{
    fieldname: String,
    filename: String,
    originalname: String,
    mimetype: String
  }],
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true, strict: false });

const Application = mongoose.model('Application', ApplicationSchema);
export default Application;