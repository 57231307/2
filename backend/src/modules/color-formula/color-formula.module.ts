import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColorFormulaController, ColorMatchingResultController } from './controllers';
import { ColorFormulaService, ColorMatchingResultService } from './services';
import { ColorFormula, ColorFormulaItem, ColorDifference, ColorMatchingResult } from './entities';
import { Customer } from '../base-data/entities/customer.entity';

/**
 * 颜色配方模块
 * 包含颜色配方管理、配方明细管理、色差检测和配色结果记录功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ColorFormula, ColorFormulaItem, ColorDifference, ColorMatchingResult, Customer]),
  ],
  controllers: [ColorFormulaController, ColorMatchingResultController],
  providers: [ColorFormulaService, ColorMatchingResultService],
  exports: [ColorFormulaService, ColorMatchingResultService],
})
export class ColorFormulaModule {}