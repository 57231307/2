import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { QualityService } from '../services/quality.service';
import { QualityInspection } from '../models/quality.model';

@Component({
  selector: 'app-quality-inspection-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      @if (inspection()) {
        <!-- 页面标题 -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">质检报告详情</h1>
          <div class="flex gap-3">
            <button (click)="printReport()" class="btn-secondary">
              打印报告
            </button>
            <button [routerLink]="['/quality/inspections', inspection()!.id, 'edit']" class="btn-primary">
              编辑报告
            </button>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="card mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">报告信息</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">报告编号</label>
                <p class="text-gray-900">{{ inspection()!.reportNo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">检验日期</label>
                <p class="text-gray-900">{{ inspection()!.inspectionDate | date: 'yyyy-MM-dd' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">检验员</label>
                <p class="text-gray-900">{{ inspection()!.inspector }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">检验结果</label>
                <p>
                  <span [class]="getResultClass(inspection()!.result)">
                    {{ inspection()!.result }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 批次信息 -->
        <div class="card mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">批次信息</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">批次编码</label>
                <p class="text-gray-900">{{ inspection()!.batchCode }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">缸号</label>
                <p class="text-gray-900">{{ inspection()!.dyeLotNo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">匹号</label>
                <p class="text-gray-900">{{ inspection()!.pieceNo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">质检标准</label>
                <p class="text-gray-900">{{ inspection()!.standardName }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 检验项目明细 -->
        <div class="card mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">检验项目明细</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-8">#</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">项目名称</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">检测方法</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">合格范围</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">单位</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">实际值</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">是否合格</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of inspection()!.items; track item.id; let i = $index) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-600">{{ i + 1 }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.itemName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.checkMethod }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.qualifiedRange }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.unit || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 font-medium">{{ item.actualValue }}</td>
                    <td class="px-4 py-3 text-center">
                      @if (item.isQualified) {
                        <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-700">合格</span>
                      } @else {
                        <span class="px-2 py-1 text-xs rounded bg-red-100 text-red-700">不合格</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 备注 -->
        @if (inspection()!.notes) {
          <div class="card">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">备注</h2>
            </div>
            <div class="p-6">
              <p class="text-gray-700 whitespace-pre-wrap">{{ inspection()!.notes }}</p>
            </div>
          </div>
        }
      } @else {
        <div class="flex items-center justify-center h-64">
          <div class="text-gray-500">加载中...</div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QualityInspectionDetailComponent implements OnInit {
  private qualityService = inject(QualityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  inspection = signal<QualityInspection | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInspection(id);
    } else {
      this.router.navigate(['/quality/inspections']);
    }
  }

  loadInspection(id: string): void {
    this.qualityService.getQualityInspection(id).subscribe({
      next: (inspection) => this.inspection.set(inspection),
      error: (err) => {
        console.error('加载质检报告失败', err);
        this.router.navigate(['/quality/inspections']);
      }
    });
  }

  printReport(): void {
    window.print();
  }

  getResultClass(result: string): string {
    const classes: Record<string, string> = {
      '合格': 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      '不合格': 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
      '让步接收': 'px-2 py-1 text-xs rounded bg-orange-100 text-orange-700'
    };
    return classes[result] || '';
  }
}