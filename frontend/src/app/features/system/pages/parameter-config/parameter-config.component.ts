import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SystemService } from '../../services/system.service';

interface SystemParameter {
  id: string;
  parameterKey: string;
  parameterValue: string;
  parameterType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  parameterName: string;
  description: string | null;
  parameterGroup: string | null;
  isActive: boolean;
  isEditable: boolean;
  sortOrder: number;
}

@Component({
  selector: 'app-parameter-config',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">系统参数配置</h1>
        <button (click)="openCreateModal()" class="btn-primary">
          新建参数
        </button>
      </div>

      <!-- 分组筛选 -->
      <div class="card mb-4">
        <div class="p-4 flex gap-2 flex-wrap">
          <button
            (click)="filterByGroup(null)"
            class="px-4 py-2 text-sm rounded"
            [class.bg-primary-600]="!selectedGroup()"
            [class.text-white]="!selectedGroup()"
            [class.bg-gray-100]="selectedGroup()"
            [class.text-gray-700]="selectedGroup()"
          >
            全部
          </button>
          @for (group of groups(); track group) {
            <button
              (click)="filterByGroup(group)"
              class="px-4 py-2 text-sm rounded"
              [class.bg-primary-600]="selectedGroup() === group"
              [class.text-white]="selectedGroup() === group"
              [class.bg-gray-100]="selectedGroup() !== group"
              [class.text-gray-700]="selectedGroup() !== group"
            >
              {{ group }}
            </button>
          }
        </div>
      </div>

      <!-- 参数列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">参数键</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">参数名称</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">参数值</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">类型</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">分组</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (param of filteredParameters(); track param.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-sm font-mono text-gray-800">{{ param.parameterKey }}</td>
                  <td class="px-4 py-2 text-sm text-gray-800">{{ param.parameterName }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">{{ param.parameterValue }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ param.parameterType }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ param.parameterGroup || '-' }}</td>
                  <td class="px-4 py-2">
                    <span [class]="param.isActive ? 'px-2 py-1 text-xs rounded bg-green-100 text-green-700' : 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-700'">
                      {{ param.isActive ? '启用' : '停用' }}
                    </span>
                  </td>
                  <td class="px-4 py-2">
                    <div class="flex gap-2">
                      <button (click)="openEditModal(param)" class="text-primary-600 hover:text-primary-800 text-sm">
                        编辑
                      </button>
                      @if (param.isEditable) {
                        <button (click)="deleteParameter(param)" class="text-red-600 hover:text-red-800 text-sm">
                          删除
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    暂无参数数据
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- 新建/编辑弹窗 -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold text-gray-800">{{ editingParameter() ? '编辑参数' : '新建参数' }}</h2>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">参数键 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.parameterKey"
                  [disabled]="!!editingParameter()"
                  class="input-field w-full"
                  placeholder="如：system.company.name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">参数名称 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.parameterName"
                  class="input-field w-full"
                  placeholder="请输入参数名称"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">参数值 *</label>
                <textarea
                  [(ngModel)]="formData.parameterValue"
                  rows="3"
                  class="input-field w-full"
                  placeholder="请输入参数值"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">参数类型</label>
                <select [(ngModel)]="formData.parameterType" class="input-field w-full">
                  <option value="STRING">字符串</option>
                  <option value="NUMBER">数字</option>
                  <option value="BOOLEAN">布尔值</option>
                  <option value="JSON">JSON对象</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">参数分组</label>
                <input
                  type="text"
                  [(ngModel)]="formData.parameterGroup"
                  class="input-field w-full"
                  placeholder="如：系统配置、财务配置"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  [(ngModel)]="formData.description"
                  rows="2"
                  class="input-field w-full"
                  placeholder="请输入参数描述"
                ></textarea>
              </div>
            </div>
            <div class="p-4 border-t flex justify-end gap-2">
              <button (click)="closeModal()" class="btn-secondary">取消</button>
              <button (click)="saveParameter()" class="btn-primary">保存</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParameterConfigComponent implements OnInit {
  private systemService = inject(SystemService);

  parameters = signal<SystemParameter[]>([]);
  groups = signal<string[]>([]);
  selectedGroup = signal<string | null>(null);
  filteredParameters = signal<SystemParameter[]>([]);

  showModal = signal(false);
  editingParameter = signal<SystemParameter | null>(null);

  formData: any = {};

  ngOnInit(): void {
    this.loadParameters();
    this.loadGroups();
  }

  loadParameters(): void {
    this.systemService.getSystemParameters().subscribe({
      next: (result: any) => {
        this.parameters.set(result.data || []);
        this.applyFilter();
      },
      error: (err) => console.error('加载参数列表失败', err)
    });
  }

  loadGroups(): void {
    this.systemService.getSystemParameterGroups().subscribe({
      next: (result: any) => {
        this.groups.set(result.data || []);
      },
      error: (err) => console.error('加载分组失败', err)
    });
  }

  filterByGroup(group: string | null): void {
    this.selectedGroup.set(group);
    this.applyFilter();
  }

  applyFilter(): void {
    const group = this.selectedGroup();
    const all = this.parameters();
    if (!group) {
      this.filteredParameters.set(all);
    } else {
      this.filteredParameters.set(all.filter(p => p.parameterGroup === group));
    }
  }

  openCreateModal(): void {
    this.editingParameter.set(null);
    this.formData = {
      parameterKey: '',
      parameterName: '',
      parameterValue: '',
      parameterType: 'STRING',
      parameterGroup: this.selectedGroup(),
      description: ''
    };
    this.showModal.set(true);
  }

  openEditModal(param: SystemParameter): void {
    this.editingParameter.set(param);
    this.formData = { ...param };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingParameter.set(null);
  }

  saveParameter(): void {
    if (!this.formData.parameterKey || !this.formData.parameterName || !this.formData.parameterValue) {
      alert('请填写必填项');
      return;
    }

    if (this.editingParameter()) {
      this.systemService.updateSystemParameter(this.editingParameter()!.parameterKey, this.formData).subscribe({
        next: () => {
          this.loadParameters();
          this.closeModal();
        },
        error: (err) => console.error('更新参数失败', err)
      });
    } else {
      this.systemService.createSystemParameter(this.formData).subscribe({
        next: () => {
          this.loadParameters();
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => console.error('创建参数失败', err)
      });
    }
  }

  deleteParameter(param: SystemParameter): void {
    if (!param.isEditable) {
      alert('该参数不可删除');
      return;
    }
    if (confirm(`确定要删除参数 "${param.parameterName}" 吗？`)) {
      this.systemService.deleteSystemParameter(param.parameterKey).subscribe({
        next: () => {
          this.loadParameters();
          this.loadGroups();
        },
        error: (err) => console.error('删除参数失败', err)
      });
    }
  }
}
