import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import * as moment from 'moment';
import { AttendanceSchema } from '../schemas/attendance.schema';
import { WorkShiftSchema } from '../schemas/workshift.schema';
import { HolidaySchema } from '../schemas/holiday.schema';
import { LeaveRequestSchema } from '../schemas/leaveApplication.schema';
import { UserSchema } from '../schemas/user.schema';
import { EmployeeMonthlyPayrollSchema} from '../schemas/payroll.schema';

@Injectable()
export class PayrollService {
  constructor(
    private readonly tenantService: TenantService,
  ) {}

  private async getModel(tenantId: string, domain: string, modelName: string, schema: any) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models[modelName] || tenantDb.model(modelName, schema);
  }

  async calculateDailyPayroll(tenantId: string, domain: string, date: Date) {
    console.log("tenantId:",tenantId,"domain:",domain);
    
    const employees = await this.getAllEmployees(tenantId, domain);
    const payrollData = [];
  
    for (const employee of employees) {
      const dailyPayroll = await this.calculateEmployeeDailyPayroll(tenantId, domain, employee._id, date);
      payrollData.push(dailyPayroll);
    }
  
    await this.saveMonthlyPayroll(tenantId, domain, date, payrollData);
  
    return payrollData;
  }
  

  private async calculateEmployeeDailyPayroll(tenantId: string, domain: string, employeeId: string, date: Date) {
    const employee = await this.getEmployee(tenantId, domain, employeeId);
    const workShift = await this.getWorkShift(tenantId, domain, employee._id);
    let attendance = await this.getAttendanceByDate(tenantId, domain, employeeId, date);
    const isHoliday = await this.isHoliday(tenantId, domain, date);
    const leaveRequest = await this.getLeaveRequestByDate(tenantId, domain, employeeId, date);
  
    // If no attendance found, create an "Absent" attendance record
    if (!attendance) {
      const AttendanceModel = await this.getModel(tenantId, domain, 'Attendance', AttendanceSchema);
      attendance = new AttendanceModel({
        employee: employeeId,
        date: date,
        workShift: workShift ? workShift._id : null,
        status: 'Absent',
        hoursWorked: 0,
        lateArrivalMinutes: 0,
        earlyDepartureMinutes: 0,
      });
      await attendance.save();
    }
  
    console.log('employee:', employee);
    console.log('workshift:', workShift);
    console.log('attendance:', attendance);
    console.log('isHoliday:', isHoliday);
    console.log('leaveRequests:', leaveRequest);
  
    // Calculate daily salary based on workshift or default to 30 days
    let workingDaysPerMonth: number;
    if (workShift && workShift.workingDays) {
      workingDaysPerMonth = this.calculateWorkingDaysInMonth(workShift.workingDays);
    } else {
      workingDaysPerMonth = 30;
    }
  
    const dailySalary = employee.basicSalary / workingDaysPerMonth;
    let payForDay = dailySalary;
  
    console.log("PayforDay:", payForDay, "For:", employee.name);
  
    // Check if the current day is a working day according to the workshift
    const currentDayName = moment(date).format('dddd');
    const isWorkingDay = !workShift || !workShift.workingDays || workShift.workingDays.includes(currentDayName);
  
    if (isHoliday) {
      return { employeeId, date, salary: payForDay, type: 'Holiday' };
    }
  
    if (leaveRequest) {
      if (leaveRequest.status === 'Approved') {
        return { employeeId, date, salary: payForDay, type: 'Approved Leave' };
      } else {
        payForDay = 0;
        return { employeeId, date, salary: payForDay, type: 'Unapproved Leave' };
      }
    }
  
    if (!isWorkingDay) {
      return { employeeId, date, salary: 0, type: 'Non-Working Day' };
    }
  
    if (attendance.status === 'Absent') {
      payForDay = 0;
      return { employeeId, date, salary: payForDay, type: 'Absent' };
    }
  
    if (workShift) {
      const shiftDurationHours = this.calculateShiftDuration(workShift.shiftIn, workShift.shiftOut, workShift.shiftOutNextDay);
      const lateDeduction = (attendance.lateArrivalMinutes / 60) * (dailySalary / shiftDurationHours);
      const earlyDeduction = (attendance.earlyDepartureMinutes / 60) * (dailySalary / shiftDurationHours);
      payForDay -= (lateDeduction + earlyDeduction);
    }
  
    const dailyAllowances = employee.allowances.reduce((sum, allowance) => sum + (allowance.amount / workingDaysPerMonth), 0);
    payForDay += dailyAllowances;
  
    return { employeeId, date, salary: payForDay, type: 'Regular' };
  }

private async saveMonthlyPayroll(tenantId: string, domain: string, date: Date, dailyPayrollData: any[]) {
  const EmployeeMonthlyPayrollModel = await this.getModel(tenantId, domain, 'EmployeeMonthlyPayroll', EmployeeMonthlyPayrollSchema);
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed

  for (const dailyRecord of dailyPayrollData) {
    const { employeeId } = dailyRecord;
    
    let monthlyPayroll = await EmployeeMonthlyPayrollModel.findOne({ employeeId, year, month }).exec();

    if (!monthlyPayroll) {
      monthlyPayroll = new EmployeeMonthlyPayrollModel({
        employeeId,
        year,
        month,
        dailyRecords: []
      });
    }

    const existingRecordIndex = monthlyPayroll.dailyRecords.findIndex(
      record => record.date.getTime() === dailyRecord.date.getTime()
    );

    if (existingRecordIndex !== -1) {
      monthlyPayroll.dailyRecords[existingRecordIndex] = dailyRecord;
    } else {
      monthlyPayroll.dailyRecords.push(dailyRecord);
    }

    // Update totals
    monthlyPayroll.totalSalary = monthlyPayroll.dailyRecords.reduce((sum, record) => sum + record.salary, 0);
    monthlyPayroll.totalWorkingDays = monthlyPayroll.dailyRecords.length;
    monthlyPayroll.totalPresentDays = monthlyPayroll.dailyRecords.filter(record => record.type === 'Regular').length;
    monthlyPayroll.totalAbsentDays = monthlyPayroll.dailyRecords.filter(record => record.type === 'Absent').length;
    monthlyPayroll.totalLeaveDays = monthlyPayroll.dailyRecords.filter(record => record.type === 'Approved Leave').length;
    monthlyPayroll.totalHolidays = monthlyPayroll.dailyRecords.filter(record => record.type === 'Holiday').length;

    await monthlyPayroll.save();
  }
}

private calculateWorkingDaysInMonth(workingDays: string[]): number {
  const daysInMonth = moment().daysInMonth();
  let workingDaysCount = 0;

  console.log('daysInMonth:',daysInMonth);
  

  for (let i = 1; i <= daysInMonth; i++) {
    const dayName = moment().date(i).format('dddd');
    console.log("dayName:",dayName);
    
    if (workingDays.includes(dayName)) {
      workingDaysCount++;
    }
  }
  console.log('workingDaysCount:',workingDaysCount);
  
  return workingDaysCount;
}

private calculateShiftDuration(shiftIn: string, shiftOut: string, shiftOutNextDay: boolean): number {
  const startTime = moment(shiftIn, 'HH:mm');
  let endTime = moment(shiftOut, 'HH:mm');

  if (shiftOutNextDay) {
    endTime.add(1, 'day');
  }

  return endTime.diff(startTime, 'hours', true);
}

  private async getAllEmployees(tenantId: string, domain: string) {
    const UserModel = await this.getModel(tenantId, domain, 'User', UserSchema);
    return UserModel.find({}).exec();
  }

  private async getEmployee(tenantId: string, domain: string, employeeId: string) {
    const UserModel = await this.getModel(tenantId, domain, 'User', UserSchema);
    return UserModel.findById(employeeId).exec();
  }

  private async getWorkShift(tenantId: string, domain: string, employeeId: string) {
    const WorkShiftModel = await this.getModel(tenantId, domain, 'WorkShift', WorkShiftSchema);
    const UserModel = await this.getModel(tenantId, domain, 'User', UserSchema);
    const employee = await UserModel.findById(employeeId).populate('workShift').exec();
    return employee.workShift;
  }

  private async getAttendanceByDate(tenantId: string, domain: string, employeeId: string, date: Date) {
    const AttendanceModel = await this.getModel(tenantId, domain, 'Attendance', AttendanceSchema);
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();
    return AttendanceModel.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).exec();
  }

  private async isHoliday(tenantId: string, domain: string, date: Date) {
    const HolidayModel = await this.getModel(tenantId, domain, 'Holiday', HolidaySchema);
    const holiday = await HolidayModel.findOne({
      startDate: { $lte: date },
      endDate: { $gte: date }
    }).exec();
    return !!holiday;
  }

  private async getLeaveRequestByDate(tenantId: string, domain: string, employeeId: string, date: Date) {
    const LeaveRequestModel = await this.getModel(tenantId, domain, 'LeaveRequest', LeaveRequestSchema);
    return LeaveRequestModel.findOne({
      userId: employeeId,
      startDate: { $lte: date },
      endDate: { $gte: date }
    }).exec();
  }

  async getAttendanceData(tenantId: string, domain: string, year?: number, month?: number, employeeId?: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    const EmployeeMonthlyPayrollModel = tenantDb.model('EmployeeMonthlyPayroll', EmployeeMonthlyPayrollSchema);

    const currentDate = moment();
    const queryYear = year || currentDate.year();
    const queryMonth = month || currentDate.month() + 1;

    let query: any = { year: queryYear, month: queryMonth };
    if (employeeId) {
      query.employeeId = employeeId;
    }

    const payrollData = await EmployeeMonthlyPayrollModel.find(query).exec();

    if (payrollData.length === 0) {
      throw new NotFoundException('No attendance data found for the specified period.');
    }

    return payrollData.map(data => ({
      employeeId: data.employeeId,
      year: data.year,
      month: data.month,
      attendanceTable: data.dailyRecords.map(record => ({
        date: moment(record.date).format('YYYY-MM-DD'),
        status: record.type,
        salary: record.salary
      })),
      summary: {
        totalSalary: data.totalSalary,
        totalWorkingDays: data.totalWorkingDays,
        totalPresentDays: data.totalPresentDays,
        totalAbsentDays: data.totalAbsentDays,
        totalLeaveDays: data.totalLeaveDays,
        totalHolidays: data.totalHolidays
      }
    }));
  }
}