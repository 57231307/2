import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatternController, PatternCopyrightController, PatternDesignController } from './controllers';
import { PatternService, PatternCopyrightService, PatternDesignService } from './services';
import { Pattern, PatternCopyright, PatternDesign } from './entities';

/**
 * 花型管理模块
 * 包含花型库管理、花型版权管理和花型设计记录功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Pattern, PatternCopyright, PatternDesign]),
  ],
  controllers: [PatternController, PatternCopyrightController, PatternDesignController],
  providers: [PatternService, PatternCopyrightService, PatternDesignService],
  exports: [PatternService, PatternCopyrightService, PatternDesignService],
})
export class PatternModule {}
