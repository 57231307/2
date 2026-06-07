import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SystemService } from '../../services/system.service';

interface Position {
  id: string;
  positionCode: string;
  positionName: string;
  departmentId: string | null;
  departmentName: string | null;
  jobResponsibilities: string | null;
  requirements: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  remark: string | null;
}

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">岗位管理</h1>
        <button (click)="openCreateModal()" class="btn-primary">
          新建岗位
        </button>
      </div>

      <!-- 筛选条件 -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">关键词</label>
              <input
                type="text"
                [(ngModel)]="searchKeyword"
                (keyup.enter)="loadData()"
                class="input-field w-full"
                placeholder="岗位编号/名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">部门</label>
              <select [(ngModel)]="searchDepartmentId" class="input-field w-full">
                <option value="">全部</option>
                @for (dept of departments(); track dept.id) {
                  <option [value]="dept.id">{{ dept.departmentName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select [(ngModel)]="searchStatus" class="input-field w-full">
                <option value="">全部</option>
                <option value="ACTIVE">启用</option>
                <option value="INACTIVE">停用</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button (click)="loadData()" class="btn-primary">查询</button>
            <button (click)="resetFilter()" class="btn-secondary">重置</button>
          </div>
        </div>
      </div>

      <!-- 岗位列表 -->
      <div class="card">
        <div class="p-4">
          @if (dataList().length > 0) {
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">岗位编号</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">岗位名称</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">所属部门</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">状态</th>
                  <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">排序</th>
                  <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (position of dataList(); track position.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-2 text-sm text-gray-800">{{ position.positionCode }}</td>
                    <td class="px-4 py-2 text-sm text-gray-800">{{ position.positionName }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ position.departmentName || '-' }}</td>
                    <td class="px-4 py-2">
                      <span [class]="position.status === 'ACTIVE' ? 'px-2 py-1 text-xs rounded bg-green-100 text-green-700' : 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-700'">
                        {{ position.status === 'ACTIVE' ? '启用' : '停用' }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm text-center text-gray-600">{{ position.sortOrder }}</td>
                    <td class="px-4 py-2 text-center">
                      <div class="flex justify-center gap-2">
                        <button (click)="openEditModal(position)" class="text-blue-600 hover:text-blue-800 text-sm">编辑</button>
                        <button (click)="deletePosition(position)" class="text-red-600 hover:text-red-800 text-sm">删除</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <!-- 分页 -->
            <div class="flex justify-between items-center mt-4">
              <span class="text-sm text-gray-600">共 {{ total() }} 条</span>
              <div class="flex gap-2">
                <button
                  (click)="prevPage()"
                  [disabled]="page() === 1"
                  class="btn-secondary disabled:opacity-50"
                >
                  上一页
                </button>
                <span class="px-4 py-2 text-sm text-gray-600">
                  第 {{ page() }} / {{ totalPages() }} 页
                </span>
                <button
                  (click)="nextPage()"
                  [disabled]="page() >= totalPages()"
                  class="btn-secondary disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          } @else {
            <div class="text-center text-gray-500 py-8">暂无岗位数据</div>
          }
        </div>
      </div>

      <!-- 新建/编辑弹窗 -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold text-gray-800">{{ editingPosition() ? '编辑岗位' : '新建岗位' }}</h2>
            </div>
            <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">岗位编号 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.positionCode"
                  [disabled]="!!editingPosition()"
                  class="input-field w-full"
                  placeholder="请输入岗位编号"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">岗位名称 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.positionName"
                  class="input-field w-full"
                  placeholder="请输入岗位名称"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
                <select [(ngModel)]="formData.departmentId" class="input-field w-full">
                  <option [ngValue]="null">无</option>
                  @for (dept of departments(); track dept.id) {
                    <option [ngValue]="dept.id">{{ dept.departmentName }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">岗位职责</label>
                <textarea
                  [(ngModel)]="formData.jobResponsibilities"
                  rows="3"
                  class="input-field w-full"
                  placeholder="请输入岗位职责描述"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">任职要求</label>
                <textarea
                  [(ngModel)]="formData.requirements"
                  rows="3"
                  class="input-field w-full"
                  placeholder="请输入任职要求"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">排序号</label>
                <input
                  type="number"
                  [(ngModel)]="formData.sortOrder"
                  class="input-field w-full"
                  placeholder="数值越小越靠前"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  [(ngModel)]="formData.remark"
                  rows="2"
                  class="input-field w-full"
                  placeholder="请输入备注"
                ></textarea>
              </div>
            </div>
            <div class="p-4 border-t flex justify-end gap-2">
              <button (click)="closeModal()" class="btn-secondary">取消</button>
              <button (click)="savePosition()" class="btn-primary">保存</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionListComponent implements OnInit {
  private systemService = inject(SystemService);

  dataList = signal<Position[]>([]);
  departments = signal<any[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = 20;

  searchKeyword = '';
  searchDepartmentId = '';
  searchStatus = '';

  showModal = signal(false);
  editingPosition = signal<Position | null>(null);
  formData: any = {
    positionCode: '',
    positionName: '',
    departmentId: null,
    jobResponsibilities: '',
    requirements: '',
    sortOrder: 0,
    remark: ''
  };

  ngOnInit(): void {
    this.loadDepartments();
    this.loadData();
  }

  loadDepartments(): void {
    this.systemService.getActiveDepartments().subscribe({
      next: (result: any) => {
        this.departments.set(result.data || result || []);
      },
      error: (err) => console.error('加载部门列表失败', err)
    });
  }

  loadData(): void {
    const params: any = {
      page: this.page(),
      limit: this.pageSize,
    };
    if (this.searchKeyword) params.keyword = this.searchKeyword;
    if (this.searchDepartmentId) params.departmentId = this.searchDepartmentId;
    if (this.searchStatus) params.status = this.searchStatus;

    this.systemService.getPositions(params).subscribe({
      next: (result: any) => {
        this.dataList.set(result.data || []);
        this.total.set(result.total || 0);
      },
      error: (err) => console.error('加载岗位列表失败', err)
    });
  }

  totalPages(): number {
    return Math.ceil(this.total() / this.pageSize) || 1;
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadData();
    }
  }

  resetFilter(): void {
    this.searchKeyword = '';
    this.searchDepartmentId = '';
    this.searchStatus = '';
    this.page.set(1);
    this.loadData();
  }

  openCreateModal(): void {
    this.editingPosition.set(null);
    this.formData = {
      positionCode: '',
      positionName: '',
      departmentId: null,
      jobResponsibilities: '',
      requirements: '',
      sortOrder: 0,
      remark: ''
    };
    this.showModal.set(true);
  }

  openEditModal(position: Position): void {
    this.editingPosition.set(position);
    this.formData = { ...position };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingPosition.set(null);
  }

  savePosition(): void {
    if (!this.formData.positionCode || !this.formData.positionName) {
      alert('请填写必填项');
      return;
    }

    const observable = this.editingPosition()
      ? this.systemService.updatePosition(this.editingPosition()!.id, this.formData)
      : this.systemService.createPosition(this.formData);

    observable.subscribe({
      next: () => {
        alert('保存成功');
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        console.error('保存失败', err);
        alert('保存失败，请重试');
      }
    });
  }

  deletePosition(position: Position): void {
    if (confirm(`确定要删除岗位 "${position.positionName}" 吗？`)) {
      this.systemService.deletePosition(position.id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('删除失败', err);
          alert('删除失败，请重试');
        }
      });
    }
  }
}
