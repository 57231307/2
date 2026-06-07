import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  ProcessRoute,
  ProcessStep,
  ProcessRouteStatus,
  StepType,
  CreateProcessRouteParams,
  CreateProcessStepParams,
} from '../../models/process-route.model';

@Component({
  selector: 'app-process-route-form',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? '编辑工艺路线' : '新建工艺路线' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ isEdit ? '修改工艺路线信息' : '创建新的生产工艺路线' }}</p>
        </div>
        <button (click)="goBack()" class="btn-secondary">
          返回列表
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 基本信息 -->
        <div class="card lg:col-span-1">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">路线名称 <span class="text-red-500">*</span></label>
              <input
                type="text"
                [(ngModel)]="formData.routeName"
                [disabled]="isView"
                class="input-field w-full"
                placeholder="请输入路线名称"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">产品类型 <span class="text-red-500">*</span></label>
              <input
                type="text"
                [(ngModel)]="formData.productType"
                [disabled]="isView"
                class="input-field w-full"
                placeholder="如：染色布、印花布"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">版本</label>
              <input
                type="text"
                [(ngModel)]="formData.version"
                [disabled]="isView"
                class="input-field w-full"
                placeholder="如：1.0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea
                [(ngModel)]="formData.notes"
                [disabled]="isView"
                rows="3"
                class="input-field w-full"
                placeholder="备注信息"
              ></textarea>
            </div>

            @if (!isView) {
              <button (click)="saveRoute()" class="btn-primary w-full">
                保存工艺路线
              </button>
            }
          </div>
        </div>

        <!-- 工序列表 -->
        <div class="card lg:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">工序列表</h2>
            @if (!isView && routeId) {
              <button (click)="showAddStepDialog()" class="btn-primary">
                添加工序
              </button>
            }
          </div>

          @if (steps().length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">序号</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">工序编号</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">工序名称</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">标准工时</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">标准工价</th>
                    @if (!isView) {
                      <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (step of steps(); track step.id; let i = $index) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-3 text-sm text-gray-600">{{ i + 1 }}</td>
                      <td class="px-4 py-3 text-sm text-gray-800">{{ step.stepNo }}</td>
                      <td class="px-4 py-3 text-sm text-gray-800">{{ step.stepName }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ getStepTypeText(step.stepType) }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ step.standardHours | number:'1.2-2' }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ step.standardPrice | number:'1.2-2' }}</td>
                      @if (!isView) {
                        <td class="px-4 py-3 text-center">
                          <div class="flex gap-2 justify-center">
                            <button (click)="editStep(step)" class="text-primary-600 hover:text-primary-800 text-sm">
                              编辑
                            </button>
                            <button (click)="configureParameters(step)" class="text-blue-600 hover:text-blue-800 text-sm">
                              参数配置
                            </button>
                            <button (click)="removeStep(step)" class="text-red-600 hover:text-red-800 text-sm">
                              删除
                            </button>
                          </div>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="text-center py-8 text-gray-500">
              暂无工序，请点击"添加工序"按钮添加
            </div>
          }

          <!-- 统计信息 -->
          @if (steps().length > 0) {
            <div class="mt-4 pt-4 border-t flex justify-end gap-4">
              <span class="text-sm text-gray-600">总工序数：{{ steps().length }}</span>
              <span class="text-sm text-gray-600">总标准工时：{{ totalStandardHours() | number:'1.2-2' }} 小时</span>
            </div>
          }
        </div>
      </div>

      <!-- 添加工序弹窗 -->
      @if (showStepDialog()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ editingStep ? '编辑工序' : '添加工序' }}</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">工序编号 <span class="text-red-500">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="stepForm.stepNo"
                  class="input-field w-full"
                  placeholder="如：GX001"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">工序名称 <span class="text-red-500">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="stepForm.stepName"
                  class="input-field w-full"
                  placeholder="如：染色"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">工序类型 <span class="text-red-500">*</span></label>
                <select [(ngModel)]="stepForm.stepType" class="input-field w-full">
                  <option value="">请选择</option>
                  <option value="dyeing">染色</option>
                  <option value="setting">定型</option>
                  <option value="cutting">裁剪</option>
                  <option value="sewing">缝制</option>
                  <option value="packaging">包装</option>
                  <option value="printing">印花</option>
                  <option value="steaming">蒸化</option>
                  <option value="washing">水洗</option>
                  <option value="ironing">熨烫</option>
                  <option value="inspecting">检验</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">标准工时（小时）<span class="text-red-500">*</span></label>
                <input
                  type="number"
                  [(ngModel)]="stepForm.standardHours"
                  class="input-field w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">标准工价（元）<span class="text-red-500">*</span></label>
                <input
                  type="number"
                  [(ngModel)]="stepForm.standardPrice"
                  class="input-field w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  [(ngModel)]="stepForm.notes"
                  rows="2"
                  class="input-field w-full"
                  placeholder="备注信息"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button (click)="closeStepDialog()" class="btn-secondary">
                取消
              </button>
              <button (click)="saveStep()" class="btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      }

      <!-- 工序参数配置弹窗 -->
      @if (showParamsDialog()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">工序参数配置 - {{ editingStep?.stepName }}</h3>

            <div class="space-y-4">
              <div class="text-sm text-gray-500 mb-4">
                工序类型：{{ getStepTypeText(editingStep?.stepType || '') }}
              </div>

              <div class="border rounded-lg p-4 space-y-3">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-700">工艺参数</span>
                  <button (click)="addParameter()" class="text-sm text-primary-600 hover:text-primary-800">
                    + 添加参数
                  </button>
                </div>

                @for (param of stepParameters(); track $index; let i = $index) {
                  <div class="flex gap-2 items-center">
                    <input
                      type="text"
                      [(ngModel)]="param.name"
                      class="input-field flex-1"
                      placeholder="参数名称（如：温度）"
                    />
                    <input
                      type="text"
                      [(ngModel)]="param.value"
                      class="input-field flex-1"
                      placeholder="参数值（如：180）"
                    />
                    <input
                      type="text"
                      [(ngModel)]="param.unit"
                      class="input-field w-20"
                      placeholder="单位"
                    />
                    <button (click)="removeParameter(i)" class="text-red-600 hover:text-red-800">
                      删除
                    </button>
                  </div>
                }

                @if (stepParameters().length === 0) {
                  <div class="text-center py-4 text-gray-500 text-sm">
                    暂无参数，点击"添加参数"按钮添加工序参数
                  </div>
                }
              </div>

              <!-- 常用参数模板 -->
              <div class="border rounded-lg p-4">
                <span class="text-sm font-medium text-gray-700 mb-2 block">常用参数模板</span>
                <div class="flex flex-wrap gap-2">
                  @for (preset of parameterPresets; track preset.type) {
                    <button
                      (click)="applyPreset(preset)"
                      class="px-3 py-1 text-xs rounded-full border border-gray-300 hover:bg-gray-50">
                      {{ preset.label }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button (click)="closeParamsDialog()" class="btn-secondary">
                取消
              </button>
              <button (click)="saveParameters()" class="btn-primary">
                保存参数
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessRouteFormComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly stepType = StepType;

  isEdit = false;
  isView = false;
  routeId: string | null = null;

  formData: CreateProcessRouteParams = {
    routeName: '',
    productType: '',
    version: '1.0',
    notes: '',
  };

  steps = signal<ProcessStep[]>([]);
  showStepDialog = signal(false);
  editingStep: ProcessStep | null = null;

  stepForm: CreateProcessStepParams = {
    stepNo: '',
    stepName: '',
    sequence: 1,
    standardHours: 0,
    standardPrice: 0,
    stepType: '',
    notes: '',
  };

  totalStandardHours = signal(0);

  // 参数配置相关
  showParamsDialog = signal(false);
  stepParameters = signal<{ name: string; value: string; unit: string }[]>([]);

  // 常用参数模板
  parameterPresets = [
    { type: 'dyeing', label: '染色模板', params: [
      { name: '温度', value: '130', unit: '℃' },
      { name: '时间', value: '60', unit: '分钟' },
      { name: '压力', value: '3', unit: 'bar' },
    ]},
    { type: 'setting', label: '定型模板', params: [
      { name: '温度', value: '180', unit: '℃' },
      { name: '速度', value: '30', unit: '米/分' },
      { name: '超喂', value: '5', unit: '%' },
    ]},
    { type: 'washing', label: '水洗模板', params: [
      { name: '温度', value: '60', unit: '℃' },
      { name: '时间', value: '30', unit: '分钟' },
    ]},
    { type: 'steaming', label: '蒸化模板', params: [
      { name: '温度', value: '102', unit: '℃' },
      { name: '时间', value: '45', unit: '分钟' },
    ]},
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const action = this.route.snapshot.queryParamMap.get('action');

    if (id) {
      this.routeId = id;
      if (action === 'view') {
        this.isView = true;
      } else {
        this.isEdit = true;
      }
      this.loadRoute(id);
    }
  }

  loadRoute(id: string): void {
    this.productionService.getProcessRoute(id).subscribe({
      next: (route) => {
        this.formData = {
          routeName: route.routeName,
          productType: route.productType,
          version: route.version,
          notes: route.notes || '',
        };
        this.steps.set(route.steps || []);
        this.calculateTotalHours();
      },
      error: (err) => {
        console.error('加载工艺路线失败', err);
      },
    });
  }

  saveRoute(): void {
    if (!this.formData.routeName || !this.formData.productType) {
      alert('请填写必填项');
      return;
    }

    if (this.isEdit && this.routeId) {
      this.productionService.updateProcessRoute(this.routeId, this.formData as Partial<ProcessRoute>).subscribe({
        next: () => {
          this.loadRoute(this.routeId!);
        },
        error: (err) => {
          console.error('更新工艺路线失败', err);
        },
      });
    } else {
      this.productionService.createProcessRoute(this.formData).subscribe({
        next: (route) => {
          this.routeId = route.id;
          this.isEdit = true;
          this.steps.set(route.steps || []);
        },
        error: (err) => {
          console.error('创建工艺路线失败', err);
        },
      });
    }
  }

  showAddStepDialog(): void {
    if (!this.routeId) {
      alert('请先保存工艺路线');
      return;
    }
    this.editingStep = null;
    this.stepForm = {
      stepNo: '',
      stepName: '',
      sequence: this.steps().length + 1,
      standardHours: 0,
      standardPrice: 0,
      stepType: '',
      notes: '',
    };
    this.showStepDialog.set(true);
  }

  editStep(step: ProcessStep): void {
    this.editingStep = step;
    this.stepForm = {
      stepNo: step.stepNo,
      stepName: step.stepName,
      sequence: step.sequence,
      standardHours: step.standardHours,
      standardPrice: step.standardPrice,
      stepType: step.stepType,
      notes: step.notes || '',
    };
    this.showStepDialog.set(true);
  }

  closeStepDialog(): void {
    this.showStepDialog.set(false);
    this.editingStep = null;
  }

  saveStep(): void {
    if (!this.stepForm.stepNo || !this.stepForm.stepName || !this.stepForm.stepType) {
      alert('请填写必填项');
      return;
    }

    if (!this.routeId) {
      alert('请先保存工艺路线');
      return;
    }

    if (this.editingStep) {
      // 编辑模式下暂不支持更新工序
      this.closeStepDialog();
    } else {
      this.productionService.addProcessStep(this.routeId, this.stepForm).subscribe({
        next: (route) => {
          this.steps.set(route.steps || []);
          this.calculateTotalHours();
          this.closeStepDialog();
        },
        error: (err) => {
          console.error('添加工序失败', err);
        },
      });
    }
  }

  removeStep(step: ProcessStep): void {
    if (!this.routeId) {
      return;
    }

    if (confirm(`确定要删除工序 ${step.stepName} 吗？`)) {
      this.productionService.removeProcessStep(this.routeId, step.id).subscribe({
        next: (route) => {
          this.steps.set(route.steps || []);
          this.calculateTotalHours();
        },
        error: (err) => {
          console.error('删除工序失败', err);
        },
      });
    }
  }

  calculateTotalHours(): void {
    const total = this.steps().reduce((sum, step) => sum + Number(step.standardHours), 0);
    this.totalStandardHours.set(total);
  }

  getStepTypeText(type: string): string {
    const types: Record<string, string> = {
      'dyeing': '染色',
      'setting': '定型',
      'cutting': '裁剪',
      'sewing': '缝制',
      'packaging': '包装',
      'printing': '印花',
      'steaming': '蒸化',
      'washing': '水洗',
      'ironing': '熨烫',
      'inspecting': '检验',
      'other': '其他',
    };
    return types[type] || type;
  }

  goBack(): void {
    this.router.navigate(['/production/routes']);
  }

  // 参数配置相关方法
  configureParameters(step: ProcessStep): void {
    this.editingStep = step;
    // 从工序中解析现有参数
    const existingParams = step.parameters || {};
    const paramsArray = Object.entries(existingParams).map(([name, value]) => {
      if (typeof value === 'object' && value !== null) {
        return { name, value: String((value as any).value || ''), unit: String((value as any).unit || '') };
      }
      return { name, value: String(value), unit: '' };
    });
    this.stepParameters.set(paramsArray);
    this.showParamsDialog.set(true);
  }

  addParameter(): void {
    this.stepParameters.update(params => [...params, { name: '', value: '', unit: '' }]);
  }

  removeParameter(index: number): void {
    this.stepParameters.update(params => params.filter((_, i) => i !== index));
  }

  applyPreset(preset: { type: string; params: { name: string; value: string; unit: string }[] }): void {
    this.stepParameters.set([...preset.params]);
  }

  closeParamsDialog(): void {
    this.showParamsDialog.set(false);
    this.editingStep = null;
    this.stepParameters.set([]);
  }

  saveParameters(): void {
    if (!this.editingStep) {
      return;
    }

    // 将参数数组转换为对象
    const paramsObj: Record<string, any> = {};
    this.stepParameters().forEach(param => {
      if (param.name && param.value) {
        if (param.unit) {
          paramsObj[param.name] = { value: param.value, unit: param.unit };
        } else {
          paramsObj[param.name] = param.value;
        }
      }
    });

    this.productionService.updateStepParameters(this.editingStep.id, paramsObj).subscribe({
      next: () => {
        alert('参数保存成功');
        this.closeParamsDialog();
        if (this.routeId) {
          this.loadRoute(this.routeId);
        }
      },
      error: (err) => {
        console.error('保存参数失败', err);
        alert('保存参数失败');
      },
    });
  }
}
