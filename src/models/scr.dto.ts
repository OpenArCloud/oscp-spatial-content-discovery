import { Type } from "class-transformer";

import {
  IsLatitude,
  IsLongitude,
  IsUrl,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Equals,
  ValidateNested,
} from "class-validator";

export class GeoPoseDto {
  @IsLatitude()
  north: number;

  @IsLongitude()
  east: number;

  @IsNumber()
  @IsPositive()
  vertical: number;

  @IsNumber()
  qNorth: number;

  @IsNumber()
  qEast: number;

  @IsNumber()
  qVertical: number;

  @IsNumber()
  qW: number;
}

export class ContentDto {
  @IsString()  
  id: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString({ each: true })
  keywords?: string[];

  @IsUrl()
  url: URL;

  @ValidateNested()
  @Type(() => GeoPoseDto)
  geopose: GeoPoseDto;

  @IsNumber()
  @IsOptional()
  size?: number;

  @IsString()
  @IsOptional()
  bbox?: string;
}

export class ScrDto {
  @IsString()
  @Equals("scr")
  type: string;

  @ValidateNested()
  @Type(() => ContentDto)
  content: ContentDto;

}
