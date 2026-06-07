import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  ProcessRoute,
  ProcessRouteStatus,
  ProcessRouteQueryParams,
  PageResult,
} from '../../models/process-route.model';

@Component({
  selector: 'app-process-route-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">工艺路线管理</h1>
          <p class="text-sm text-gray-500 mt-1">管理产品生产工艺路线和工序</p>
        </div>
        <button (click)="createRoute()" class="btn-primary">
          新建工艺路线
        </button>
      </div>

      <!-- 筛选区域 -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">关键词搜索</label>
            <input
              type="text"
              [(ngModel)]="queryParams.routeName"
              (ngModelChange)="onSearchChange()"
              placeholder="路线编号/名称"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">产品类型</label>
            <input
              type="text"
              [(ngModel)]="queryParams.productType"
              (ngModelChange)="loadRoutes()"
              placeholder="产品类型"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadRoutes()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="statusDraft">草稿</option>
              <option [value]="statusActive">生效</option>
              <option [value]="statusDeprecated">废弃</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 工艺路线列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">路线编号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">路线名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品类型</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">版本</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">工序数</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">总工时</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (route of routes(); track route.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewRoute(route.id)">
                    {{ route.routeNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ route.routeName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ route.productType }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ route.version }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ route.totalProcesses }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ route.totalStandardHours | number:'1.2-2' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getStatusClass(route.status)">
                      {{ getStatusText(route.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewRoute(route.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      @if (isDraft(route.status)) {
                        <button (click)="editRoute(route.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                          编辑
                        </button>
                        <button (click)="activateRoute(route)" class="text-green-600 hover:text-green-800 text-sm">
                          激活
                        </button>
                      }
                      @if (isActive(route.status)) {
                        <button (click)="deprecateRoute(route)" class="text-red-600 hover:text-red-800 text-sm">
                          废弃
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    暂无工艺路线数据
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        @if (pageResult()) {
          <div class="flex justify-between items-center mt-4 pt-4 border-t">
            <span class="text-sm text-gray-600">
              共 {{ pageResult()!.total }} 条记录，第 {{ pageResult()!.page }} / {{ pageResult()!.totalPages }} 页
            </span>
            <div class="flex gap-2">
              <button
                [disabled]="pageResult()!.page <= 1"
                (click)="goToPage(pageResult()!.page - 1)"
                class="btn-secondary disabled:opacity-50"
              >
                上一页
              </button>
              <button
                [disabled]="pageResult()!.page >= pageResult()!.totalPages"
                (click)="goToPage(pageResult()!.page + 1)"
                class="btn-secondary disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessRouteListComponent {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);

  readonly ProcessRouteStatus = ProcessRouteStatus;
  readonly statusDraft = ProcessRouteStatus["草稿"];
  readonly statusActive = ProcessRouteStatus["生效"];
  readonly statusDeprecated = ProcessRouteStatus["废弃"];

  routes = signal<ProcessRoute[]>([]);
  pageResult = signal<PageResult<ProcessRoute> | null>(null);

  queryParams: ProcessRouteQueryParams = {
    page: 1,
    pageSize: 10,
    routeNo: '',
    routeName: '',
    productType: '',
    status: undefined,
  };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.productionService.getProcessRoutes(this.queryParams).subscribe({
      next: (result) => {
        this.routes.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载工艺路线列表失败', err);
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadRoutes();
    }, 300);
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadRoutes();
  }

  createRoute(): void {
    this.router.navigate(['/production/routes/new']);
  }

  viewRoute(id: string): void {
    this.router.navigate(['/production/routes', id]);
  }

  editRoute(id: string): void {
    this.router.navigate(['/production/routes', id, 'edit']);
  }

  isDraft(status: ProcessRouteStatus): boolean {
    return status === ProcessRouteStatus["草稿"];
  }

  isActive(status: ProcessRouteStatus): boolean {
    return status === ProcessRouteStatus["生效"];
  }

  activateRoute(route: ProcessRoute): void {
    if (confirm(`确定要激活工艺路线 ${route.routeNo} 吗？`)) {
      this.productionService.activateProcessRoute(route.id).subscribe({
        next: () => {
          this.loadRoutes();
        },
        error: (err) => {
          console.error('激活工艺路线失败', err);
        },
      });
    }
  }

  deprecateRoute(route: ProcessRoute): void {
    if (confirm(`确定要废弃工艺路线 ${route.routeNo} 吗？`)) {
      this.productionService.deprecateProcessRoute(route.id).subscribe({
        next: () => {
          this.loadRoutes();
        },
        error: (err) => {
          console.error('废弃工艺路线失败', err);
        },
      });
    }
  }

  getStatusClass(status: ProcessRouteStatus): string {
    const classes: Record<string, string> = {
      [ProcessRouteStatus["草稿"]]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [ProcessRouteStatus["生效"]]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [ProcessRouteStatus["废弃"]]: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: ProcessRouteStatus): string {
    const texts: Record<string, string> = {
      [ProcessRouteStatus["草稿"]]: '草稿',
      [ProcessRouteStatus["生效"]]: '生效',
      [ProcessRouteStatus["废弃"]]: '废弃',
    };
    return texts[status] || status;
  }
}
