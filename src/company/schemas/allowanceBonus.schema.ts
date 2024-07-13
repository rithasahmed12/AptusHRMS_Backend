import mongoose, { Schema } from 'mongoose';

export const BonusSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bonus:{type:Number},
}, { timestamps: true, strict: false });

const Bonus = mongoose.model('Bonus', BonusSchema);
export default Bonus;