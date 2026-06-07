import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatternController, PatternCopyrightController } from './controllers';
import { PatternService, PatternCopyrightService } from './services';
import { Pattern, PatternCopyright } from './entities';

/**
 * 花型管理模块
 * 包含花型库管理和花型版权管理
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Pattern, PatternCopyright]),
  ],
  controllers: [PatternController, PatternCopyrightController],
  providers: [PatternService, PatternCopyrightService],
  exports: [PatternService, PatternCopyrightService],
})
export class PatternModule {}
