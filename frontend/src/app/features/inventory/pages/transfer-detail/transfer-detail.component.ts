import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryTransfer, TransferStatus, CancelTransferDto } from '../../models/transfer.model';
import { Warehouse } from '../../models/warehouse.model';

@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex items-center mb-6">
        <a routerLink="/inventory/transfers" class="text-blue-600 hover:text-blue-800 mr-2">←</a>
        <h1 class="text-2xl font-bold text-gray-800">调拨单详情</h1>
      </div>

      @if (loading()) {
        <div class="text-center py-8 text-gray-500">加载中...</div>
      } @else if (transfer()) {
        <!-- 基本信息 -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">调拨单号</label>
              <p class="text-lg font-medium">{{ transfer()!.transferNo }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">状态</label>
              <p>
                <span [class]="getStatusClass(transfer()!.status)">
                  {{ getStatusLabel(transfer()!.status) }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-500">调拨日期</label>
              <p>{{ transfer()!.transferDate | date:'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">负责人</label>
              <p>{{ transfer()!.managerName || '-' }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">源仓库</label>
              <p>{{ transfer()!.sourceWarehouseName || transfer()!.sourceWarehouseId }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">目标仓库</label>
              <p>{{ transfer()!.targetWarehouseName || transfer()!.targetWarehouseId }}</p>
            </div>
          </div>
          @if (transfer()!.remark) {
            <div class="mt-4">
              <label class="text-sm text-gray-500">备注</label>
              <p class="text-gray-700">{{ transfer()!.remark }}</p>
            </div>
          }
        </div>

        <!-- 调拨明细 -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">调拨明细</h3>
          <table class="w-full border-collapse border border-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">批次号</th>
                <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">匹号</th>
                <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">调拨数量</th>
                <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">已调出</th>
                <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">已收货</th>
                <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">单位</th>
              </tr>
            </thead>
            <tbody>
              @for (item of transfer()!.items; track item.id) {
                <tr>
                  <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.batchNo }}</td>
                  <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.rollNo }}</td>
                  <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.transferQuantity }}</td>
                  <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.dispatchedQuantity }}</td>
                  <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.receivedQuantity }}</td>
                  <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.unit }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-3">
          @if (isPendingStatus()) {
            <button (click)="onDispatch()"
                    [disabled]="operating()"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {{ operating() ? '处理中...' : '调出确认' }}
            </button>
            <button (click)="showCancelDialog = true"
                    [disabled]="operating()"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
              {{ operating() ? '处理中...' : '取消调拨' }}
            </button>
          }
          @if (isDispatchedStatus()) {
            <button (click)="onReceive()"
                    [disabled]="operating()"
                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
              {{ operating() ? '处理中...' : '调入确认' }}
            </button>
          }
        </div>

        <!-- 错误信息 -->
        @if (error()) {
          <div class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error() }}
          </div>
        }

        <!-- 成功信息 -->
        @if (success()) {
          <div class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {{ success() }}
          </div>
        }
      } @else {
        <div class="text-center py-8 text-gray-500">调拨单不存在</div>
      }
    </div>

    <!-- 取消确认弹窗 -->
    @if (showCancelDialog) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">取消调拨</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">取消原因 <span class="text-red-500">*</span></label>
            <textarea [(ngModel)]="cancelReason"
                      rows="3"
                      placeholder="请输入取消原因"
                      class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button (click)="showCancelDialog = false"
                    class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              关闭
            </button>
            <button (click)="onCancel()"
                    [disabled]="!cancelReason || operating()"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
              确认取消
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private transferService = inject(InventoryTransferService);
  private warehouseService = inject(WarehouseService);

  transfer = signal<InventoryTransfer | null>(null);
  warehouses = signal<Warehouse[]>([]);
  loading = signal(true);
  operating = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showCancelDialog = false;
  cancelReason = '';

  ngOnInit(): void {
    this.loadWarehouses();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransfer(id);
    }
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => this.warehouses.set(warehouses),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  loadTransfer(id: string): void {
    this.loading.set(true);
    this.transferService.getTransferById(id).subscribe({
      next: (transfer) => {
        this.transfer.set(transfer);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('加载调拨单失败');
        console.error('加载调拨单失败', err);
      }
    });
  }

  getStatusLabel(status: TransferStatus): string {
    const labels: Record<TransferStatus, string> = {
      [TransferStatus.待调出]: '待调出',
      [TransferStatus.部分调出]: '部分调出',
      [TransferStatus.已调出]: '已调出',
      [TransferStatus.已收货]: '已收货',
      [TransferStatus.已取消]: '已取消',
    };
    return labels[status] || status;
  }

  getStatusClass(status: TransferStatus): string {
    const classes: Record<TransferStatus, string> = {
      [TransferStatus.待调出]: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      [TransferStatus.部分调出]: 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800',
      [TransferStatus.已调出]: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      [TransferStatus.已收货]: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      [TransferStatus.已取消]: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
    };
    return classes[status] || '';
  }

  isPendingStatus(): boolean {
    return this.transfer()?.status === TransferStatus.待调出;
  }

  isDispatchedStatus(): boolean {
    return this.transfer()?.status === TransferStatus.已调出;
  }

  onDispatch(): void {
    const id = this.transfer()!.id;
    this.operating.set(true);
    this.error.set(null);
    this.success.set(null);

    this.transferService.dispatch(id).subscribe({
      next: (transfer) => {
        this.transfer.set(transfer);
        this.operating.set(false);
        this.success.set('调出确认成功');
      },
      error: (err: any) => {
        this.operating.set(false);
        this.error.set(err.error?.message || '调出确认失败');
      }
    });
  }

  onReceive(): void {
    const id = this.transfer()!.id;
    this.operating.set(true);
    this.error.set(null);
    this.success.set(null);

    this.transferService.receive(id).subscribe({
      next: (transfer) => {
        this.transfer.set(transfer);
        this.operating.set(false);
        this.success.set('调入确认成功');
      },
      error: (err: any) => {
        this.operating.set(false);
        this.error.set(err.error?.message || '调入确认失败');
      }
    });
  }

  onCancel(): void {
    if (!this.cancelReason) {
      this.error.set('请输入取消原因');
      return;
    }

    const id = this.transfer()!.id;
    this.operating.set(true);
    this.error.set(null);
    this.success.set(null);

    const request: CancelTransferDto = {
      cancelReason: this.cancelReason
    };

    this.transferService.cancel(id, request).subscribe({
      next: (transfer) => {
        this.transfer.set(transfer);
        this.operating.set(false);
        this.showCancelDialog = false;
        this.cancelReason = '';
        this.success.set('取消成功');
      },
      error: (err: any) => {
        this.operating.set(false);
        this.error.set(err.error?.message || '取消失败');
      }
    });
  }
}
