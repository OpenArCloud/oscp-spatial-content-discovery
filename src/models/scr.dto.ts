import { Type } from "class-transformer";

import {
  ArrayMaxSize,
  ArrayMinSize,
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

  @IsLongitude()
  longitude: number;

  @IsLatitude()
  latitude: number;

  @IsNumber()
  ellipsoidHeight: number;

  @IsNumber({},{each: true})
  @ArrayMaxSize(4)
  @ArrayMinSize(4)
  quaternion: number[];

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
