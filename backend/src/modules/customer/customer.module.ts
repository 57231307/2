import { Module } from '@nestjs/common';
import { BaseDataModule } from '../base-data/base-data.module';

@Module({
  imports: [BaseDataModule],
})
export class CustomerModule {}
