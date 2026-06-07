import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColorFormulaController } from './controllers/color-formula.controller';
import { ColorFormulaService } from './services/color-formula.service';
import { ColorFormula, ColorFormulaItem, ColorDifference } from './entities';

/**
 * 颜色配方模块
 * 包含颜色配方管理、配方明细管理和色差检测功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ColorFormula, ColorFormulaItem, ColorDifference]),
  ],
  controllers: [ColorFormulaController],
  providers: [ColorFormulaService],
  exports: [ColorFormulaService],
})
export class ColorFormulaModule {}