import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { SystemService } from '../../services/system.service';

interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  parentId: string | null;
  parent?: Department;
  managerId: string | null;
  managerName: string | null;
  managerPhone: string | null;
  managerEmail: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  description: string | null;
  children?: Department[];
}

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">部门管理</h1>
        <button (click)="openCreateModal()" class="btn-primary">
          新建部门
        </button>
      </div>

      <!-- 部门列表 -->
      <div class="card">
        <div class="p-4">
          @if (departments().length > 0) {
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">部门编号</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">部门名称</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">上级部门</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">负责人</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">状态</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">排序</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (dept of flatDepartments(); track dept.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-2 text-sm text-gray-800">{{ dept.departmentCode }}</td>
                    <td class="px-4 py-2">
                      <span [style.padding-left.px]="(getDepth(dept) * 20)">
                        @if (dept.children?.length) {
                          <span class="mr-1">{{ isExpanded(dept.id) ? '📂' : '📁' }}</span>
                        }
                        {{ dept.departmentName }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ dept.parent?.departmentName || '-' }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ dept.managerName || '-' }}</td>
                    <td class="px-4 py-2">
                      <span [class]="dept.status === 'ACTIVE' ? 'px-2 py-1 text-xs rounded bg-green-100 text-green-700' : 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-700'">
                        {{ dept.status === 'ACTIVE' ? '启用' : '停用' }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ dept.sortOrder }}</td>
                    <td class="px-4 py-2">
                      <div class="flex gap-2">
                        @if (dept.children?.length) {
                          <button (click)="toggleExpand(dept.id)" class="text-blue-600 hover:text-blue-800 text-sm">
                            {{ isExpanded(dept.id) ? '收起' : '展开' }}
                          </button>
                        }
                        <button (click)="openEditModal(dept)" class="text-primary-600 hover:text-primary-800 text-sm">
                          编辑
                        </button>
                        <button (click)="deleteDepartment(dept)" class="text-red-600 hover:text-red-800 text-sm">
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div class="text-center text-gray-500 py-8">暂无部门数据</div>
          }
        </div>
      </div>

      <!-- 新建/编辑弹窗 -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold text-gray-800">{{ editingDepartment() ? '编辑部门' : '新建部门' }}</h2>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">部门编号 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.departmentCode"
                  [disabled]="!!editingDepartment()"
                  class="input-field w-full"
                  placeholder="请输入部门编号"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">部门名称 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.departmentName"
                  class="input-field w-full"
                  placeholder="请输入部门名称"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">上级部门</label>
                <select [(ngModel)]="formData.parentId" class="input-field w-full">
                  <option [ngValue]="null">无（顶级部门）</option>
                  @for (dept of departments(); track dept.id) {
                    @if (dept.id !== editingDepartment()?.id) {
                      <option [ngValue]="dept.id">{{ dept.departmentName }}</option>
                    }
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                <input
                  type="text"
                  [(ngModel)]="formData.managerName"
                  class="input-field w-full"
                  placeholder="请输入负责人姓名"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input
                  type="text"
                  [(ngModel)]="formData.managerPhone"
                  class="input-field w-full"
                  placeholder="请输入联系电话"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  [(ngModel)]="formData.managerEmail"
                  class="input-field w-full"
                  placeholder="请输入邮箱"
                />
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
                <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  [(ngModel)]="formData.description"
                  rows="3"
                  class="input-field w-full"
                  placeholder="请输入部门描述"
                ></textarea>
              </div>
            </div>
            <div class="p-4 border-t flex justify-end gap-2">
              <button (click)="closeModal()" class="btn-secondary">取消</button>
              <button (click)="saveDepartment()" class="btn-primary">保存</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentListComponent implements OnInit {
  private systemService = inject(SystemService);

  departments = signal<Department[]>([]);
  showModal = signal(false);
  editingDepartment = signal<Department | null>(null);
  expandedIds = signal<Set<string>>(new Set());

  formData: any = {};

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.systemService.getDepartments().subscribe({
      next: (result: any) => {
        this.departments.set(result.data || []);
      },
      error: (err) => console.error('加载部门列表失败', err)
    });
  }

  flatDepartments(): Department[] {
    const result: Department[] = [];
    const flatten = (depts: Department[], depth = 0) => {
      for (const dept of depts) {
        result.push(dept);
        if (this.expandedIds().has(dept.id) && dept.children?.length) {
          flatten(dept.children, depth + 1);
        }
      }
    };
    flatten(this.departments());
    return result;
  }

  getDepth(dept: Department): number {
    let depth = 0;
    let current = dept;
    while (current.parentId) {
      depth++;
      const parent = this.findDepartmentById(current.parentId);
      if (!parent) break;
      current = parent;
    }
    return depth;
  }

  findDepartmentById(id: string): Department | undefined {
    const find = (depts: Department[]): Department | undefined => {
      for (const dept of depts) {
        if (dept.id === id) return dept;
        if (dept.children) {
          const found = find(dept.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return find(this.departments());
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  toggleExpand(id: string): void {
    const newSet = new Set(this.expandedIds());
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.expandedIds.set(newSet);
  }

  openCreateModal(): void {
    this.editingDepartment.set(null);
    this.formData = {
      departmentCode: '',
      departmentName: '',
      parentId: null,
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      sortOrder: 0,
      description: ''
    };
    this.showModal.set(true);
  }

  openEditModal(dept: Department): void {
    this.editingDepartment.set(dept);
    this.formData = { ...dept };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingDepartment.set(null);
  }

  saveDepartment(): void {
    if (!this.formData.departmentCode || !this.formData.departmentName) {
      alert('请填写必填项');
      return;
    }

    if (this.editingDepartment()) {
      this.systemService.updateDepartment(this.editingDepartment()!.id, this.formData).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeModal();
        },
        error: (err) => console.error('更新部门失败', err)
      });
    } else {
      this.systemService.createDepartment(this.formData).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeModal();
        },
        error: (err) => console.error('创建部门失败', err)
      });
    }
  }

  deleteDepartment(dept: Department): void {
    if (dept.children?.length) {
      alert('该部门存在子部门，无法删除');
      return;
    }
    if (confirm(`确定要删除部门 "${dept.departmentName}" 吗？`)) {
      this.systemService.deleteDepartment(dept.id).subscribe({
        next: () => this.loadDepartments(),
        error: (err) => console.error('删除部门失败', err)
      });
    }
  }
}
