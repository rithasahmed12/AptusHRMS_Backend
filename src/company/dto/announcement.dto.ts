import { IsNotEmpty, IsString } from 'class-validator';

export class AnnouncementDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsString()
  author: string;
}
