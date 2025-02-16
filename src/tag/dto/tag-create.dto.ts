import { IsString, IsHexColor } from 'class-validator';

export class TagCreateDto {
  @IsString()
  name: string;

  @IsHexColor()
  color: string;
} 