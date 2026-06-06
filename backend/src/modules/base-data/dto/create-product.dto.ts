import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductType, ProductStatus } from '../entities/product.entity';

/**
 * 图片上传 DTO
 */
export class ProductImageDto {
  @ApiPropertyOptional({ description: '图片URL' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: '图片顺序' })
  @IsNumber()
  @IsOptional()
  order?: number;
}

/**
 * 附件 DTO
 */
export class ProductAttachmentDto {
  @ApiPropertyOptional({ description: '附件名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '附件URL' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: '附件类型' })
  @IsString()
  @IsOptional()
  type?: string;
}

/**
 * 创建产品 DTO
 */
export class CreateProductDto {
  @ApiProperty({ description: '产品编码（不提供则自动生成）', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: '产品名称', example: '纯棉面料' })
  @IsString()
  @IsNotEmpty({ message: '产品名称不能为空' })
  name: string;

  @ApiProperty({ description: '产品类型', enum: ProductType, example: ProductType.FABRIC })
  @IsEnum(ProductType, { message: '产品类型无效' })
  type: ProductType;

  @ApiPropertyOptional({ description: '规格描述', example: '40S/2 棉线' })
  @IsString()
  @IsOptional()
  spec?: string;

  @ApiPropertyOptional({ description: '单位', example: 'meter' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: '颜色配方ID' })
  @IsUUID()
  @IsOptional()
  colorFormulaId?: string;

  @ApiPropertyOptional({ description: '花型ID' })
  @IsUUID()
  @IsOptional()
  patternId?: string;

  @ApiPropertyOptional({ description: '标准成本', example: 25.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  standardCost?: number;

  @ApiPropertyOptional({ description: '销售价格', example: 38.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @ApiPropertyOptional({ description: '状态', enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ description: '产品图片', type: [ProductImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: ProductImageDto[];

  @ApiPropertyOptional({ description: '产品附件', type: [ProductAttachmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttachmentDto)
  @IsOptional()
  attachments?: ProductAttachmentDto[];

  @ApiPropertyOptional({ description: '元数据' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
