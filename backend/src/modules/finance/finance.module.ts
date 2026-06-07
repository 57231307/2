/**
 * 财务模块
 * 提供应收、应付和收付款的完整功能
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  AccountReceivableController, 
  AccountPayableController, 
  PaymentController 
} from './controllers';
import { 
  AccountReceivableService, 
  AccountPayableService, 
  PaymentService 
} from './services';
import { AccountReceivable, AccountPayable, Payment } from './entities';

/**
 * 财务模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AccountReceivable, AccountPayable, Payment]),
  ],
  controllers: [AccountReceivableController, AccountPayableController, PaymentController],
  providers: [AccountReceivableService, AccountPayableService, PaymentService],
  exports: [AccountReceivableService, AccountPayableService, PaymentService],
})
export class FinanceModule {}
