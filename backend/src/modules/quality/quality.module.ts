/**
 * 质检模块
 * 提供质检标准和质检报告的完整功能
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityStandardController, QualityInspectionController } from './controllers';
import { QualityStandardService, QualityInspectionService } from './services';
import { QualityStandard, QualityInspection, QualityInspectionItem } from './entities';

/**
 * 质检模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([QualityStandard, QualityInspection, QualityInspectionItem]),
  ],
  controllers: [QualityStandardController, QualityInspectionController],
  providers: [QualityStandardService, QualityInspectionService],
  exports: [QualityStandardService, QualityInspectionService],
})
export class QualityModule {}
