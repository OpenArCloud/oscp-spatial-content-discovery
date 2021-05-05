import { Type } from "class-transformer";

import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsDefined,
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

export class QuaternionDto {

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;

  @IsNumber()
  w: number;

}

export class GeoPoseDto {
  @IsLongitude()
  longitude: number;

  @IsLatitude()
  latitude: number;

  @IsNumber()
  ellipsoidHeight: number;

  @ValidateNested()
  @IsDefined()
  @Type(() => QuaternionDto)
  quaternion: QuaternionDto;
}

export class RefDto {
  @IsString()
  contentType: string;

  @IsUrl()
  url: URL;
}

export class DefDto {
  @IsString()
  type: string;

  @IsString()
  value: string;
}

export class ContentDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString({ each: true })
  keywords?: string[];

  @IsString()
  @IsOptional()
  placekey?: string;

  @ValidateNested()
  @IsDefined()
  @ArrayNotEmpty()
  @Type(() => RefDto)
  refs: RefDto[];

  @ValidateNested()
  @IsDefined()
  @Type(() => GeoPoseDto)
  geopose: GeoPoseDto;

  @IsNumber()
  @IsOptional()
  size?: number;

  @IsString()
  @IsOptional()
  bbox?: string;

  @ValidateNested()
  @IsOptional()
  @ArrayNotEmpty()
  @Type(() => DefDto)
  definitions?: DefDto[];  
}

export class ScrDto {
  @IsString()
  @Equals("scr")
  type: string;

  @ValidateNested()
  @Type(() => ContentDto)
  content: ContentDto;
}
