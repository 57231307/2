/**
 * 财务报表控制器
 */
import { Controller, Get, Query } from '@nestjs/common';
import { FinancialReportService } from '../services/financial-report.service';

/**
 * 财务报表控制器
 */
@Controller('api/v1/financial-reports')
export class FinancialReportController {
  constructor(private readonly financialReportService: FinancialReportService) {}

  /**
   * 获取利润表
   */
  @Get('profit-loss')
  async getProfitLossReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financialReportService.getProfitLossReport(startDate, endDate);
  }

  /**
   * 获取资产负债表
   */
  @Get('balance-sheet')
  async getBalanceSheetReport(@Query('asOfDate') asOfDate: string) {
    return this.financialReportService.getBalanceSheetReport(asOfDate);
  }

  /**
   * 获取现金流量表
   */
  @Get('cash-flow')
  async getCashFlowReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financialReportService.getCashFlowReport(startDate, endDate);
  }
}
