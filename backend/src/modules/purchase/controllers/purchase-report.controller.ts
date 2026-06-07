/**
 * 采购报表控制器
 */
import { Controller, Get, Query } from '@nestjs/common';
import { PurchaseReportService } from '../services/purchase-report.service';

/**
 * 采购报表控制器
 */
@Controller('api/v1/purchase-reports')
export class PurchaseReportController {
  constructor(private readonly purchaseReportService: PurchaseReportService) {}

  /**
   * 获取采购汇总报表
   */
  @Get('summary')
  async getPurchaseSummaryReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.purchaseReportService.getPurchaseSummaryReport(startDate, endDate);
  }

  /**
   * 获取采购明细报表
   */
  @Get('detail')
  async getPurchaseDetailReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.purchaseReportService.getPurchaseDetailReport(startDate, endDate);
  }

  /**
   * 获取供应商采购绩效报表
   */
  @Get('supplier/:supplierId')
  async getSupplierPerformanceReport(@Query('supplierId') supplierId: string) {
    return this.purchaseReportService.getSupplierPerformanceReport(supplierId);
  }
}
