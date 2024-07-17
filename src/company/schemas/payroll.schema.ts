import mongoose, { Schema } from 'mongoose';

export const EmployeeMonthlyPayrollSchema = new Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  dailyRecords: [{
    date: { type: Date, required: true },
    salary: { type: Number, required: true },
    type: { type: String, required: true }
  }],
  totalSalary: { type: Number, default: 0 },
  totalWorkingDays: { type: Number, default: 0 },
  totalPresentDays: { type: Number, default: 0 },
  totalAbsentDays: { type: Number, default: 0 },
  totalLeaveDays: { type: Number, default: 0 },
  totalHolidays: { type: Number, default: 0 }
});

EmployeeMonthlyPayrollSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });

const EmployeeMonthlyPayroll = mongoose.model("EmployeeMonthlyPayroll", EmployeeMonthlyPayrollSchema);
export default EmployeeMonthlyPayroll;