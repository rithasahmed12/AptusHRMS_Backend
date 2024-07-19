// application.schema.ts
import mongoose, { Schema } from 'mongoose';
import { ApplicationSchema } from './application.schema';

export const ScheduledCandiatesSchema = ApplicationSchema;

const ScheduledCandidates = mongoose.model('ScheduledCandidates', ScheduledCandiatesSchema);
export default ScheduledCandidates;