import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyController } from './controller/company.controller';
import { CompanyService } from './services/company.service';
import { TenantService } from '../tenant/tenant.service';
import { Tenant, TenantSchema } from '../tenant/schema/tenant.schema';
import { TenantMiddleware } from 'src/middlewares/tenants.middleware';
import { JwtModule } from '@nestjs/jwt';
import { AnnouncementsController } from './controller/announcements.controller';
import { AnnouncementsService } from './services/announcements.service';
import { DepartmentController } from './controller/department.controller';
import { DepartmentService } from './services/department.service';
import { DesignationController } from './controller/designation.controller';
import { DesignationService } from './services/designation.service';
import { EmployeeController } from './controller/employees.controller';
import { EmployeeService } from './services/employees.service';
import User, { UserSchema } from './schemas/user.schema';
import Department, { DepartmentSchema } from './schemas/department.schema';
import Designation, { DesignationSchema } from './schemas/designation.schema';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ProjectController } from './controller/projects.controller';
import { ProjectService } from './services/projects.service';
import { UserModule } from 'src/user/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ConfigModule } from '@nestjs/config';
import Company, { CompanySchema } from './schemas/company.schema';
import WorkShift, { WorkShiftSchema } from './schemas/workshift.schema';
import { WorkShiftController } from './controller/workshift.controller';
import { WorkShiftService } from './services/workshift.service';
import Holiday, { HolidaySchema } from './schemas/holiday.schema';
import { HolidayController } from './controller/holiday.controller';
import { HolidayService } from './services/holiday.service';
import { LeaveController } from './controller/leave.controller';
import { LeaveService } from './services/leave.service';
import Leave, { LeaveSchema } from './schemas/leave.schema';
import Asset, { AssetSchema } from './schemas/assets.schema';
import { AssetController } from './controller/assets.controller';
import { AssetService } from './services/assets.service';
import AssetRequest, {  AssetRequestSchema } from './schemas/assetRequest.schema';
import LeaveRequest, { LeaveRequestSchema } from './schemas/leaveApplication.schema';
import Job, { JobSchema } from './schemas/job.schema';
import Application, { ApplicationSchema } from './schemas/application.schema';
import { JobController } from './controller/recruitment.controller';
import { JobService } from './services/recruitment.service';
import Attendance, { AttendanceSchema } from './schemas/attendance.schema';
import { AttendanceController } from './controller/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { PayrollController } from './controller/payroll.controller';
import { PayrollService } from './services/payroll.service';
import Payroll, { EmployeeMonthlyPayrollSchema} from './schemas/payroll.schema';
import EmployeeMonthlyPayroll from './schemas/payroll.schema';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Designation.name, schema: DesignationSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Company.name, schema: CompanySchema },
      { name: WorkShift.name, schema: WorkShiftSchema },
      { name:Holiday.name, schema: HolidaySchema},
      { name:Leave.name, schema: LeaveSchema},
      { name:Asset.name, schema: AssetSchema},
      { name:AssetRequest.name, schema: AssetRequestSchema},
      { name:LeaveRequest.name, schema: LeaveRequestSchema},
      { name:Job.name, schema: JobSchema},
      { name:Application.name, schema: ApplicationSchema},
      { name:Attendance.name, schema: AttendanceSchema},
      { name:EmployeeMonthlyPayroll.name, schema: EmployeeMonthlyPayrollSchema},
    ]),
    UserModule,
    ConfigModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [
    CompanyController,
    AnnouncementsController,
    DepartmentController,
    DesignationController,
    EmployeeController,
    ProjectController,
    WorkShiftController,
    HolidayController,
    LeaveController,
    AssetController,
    JobController,
    AttendanceController,
    PayrollController,

  ],
  providers: [
    CompanyService,
    TenantService,
    AnnouncementsService,
    DepartmentService,
    DesignationService,
    EmployeeService,
    ProjectService,
    WorkShiftService,
    HolidayService,
    LeaveService,
    AssetService,
    JobService,
    AttendanceService,
    PayrollService,
  ],
  exports:[MongooseModule]
})
export class CompanyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(CompanyController);
  }
}

export {User,Company}