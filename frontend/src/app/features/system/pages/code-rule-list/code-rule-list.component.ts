import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SystemService } from '../../services/system.service';

interface CodeRule {
  id: string;
  ruleCode: string;
  ruleName: string;
  description: string | null;
  prefix: string | null;
  dateFormat: 'YYYYMMDD' | 'YYYYMMDDHHmmss' | 'YYYYMM' | 'YYYY';
  sequenceLength: number;
  sequenceStep: number;
  currentSequence: number;
  resetDaily: boolean;
  resetMonthly: boolean;
  resetYearly: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  lastGeneratedAt: Date | null;
}

@Component({
  selector: 'app-code-rule-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">编码规则配置</h1>
        <button (click)="openCreateModal()" class="btn-primary">
          新建规则
        </button>
      </div>

      <!-- 规则列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">规则编码</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">规则名称</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">前缀</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">日期格式</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">序号长度</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">当前序号</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">重置规则</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (rule of codeRules(); track rule.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-sm font-mono text-gray-800">{{ rule.ruleCode }}</td>
                  <td class="px-4 py-2 text-sm text-gray-800">{{ rule.ruleName }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ rule.prefix || '-' }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ getDateFormatLabel(rule.dateFormat) }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ rule.sequenceLength }}</td>
                  <td class="px-4 py-2 text-sm font-medium text-orange-600">{{ rule.currentSequence }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">
                    @if (rule.resetDaily) { <span class="mr-1">日</span> }
                    @if (rule.resetMonthly) { <span class="mr-1">月</span> }
                    @if (rule.resetYearly) { <span>年</span> }
                    @if (!rule.resetDaily && !rule.resetMonthly && !rule.resetYearly) { <span>-</span> }
                  </td>
                  <td class="px-4 py-2">
                    <span [class]="rule.status === 'ACTIVE' ? 'px-2 py-1 text-xs rounded bg-green-100 text-green-700' : 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-700'">
                      {{ rule.status === 'ACTIVE' ? '启用' : '停用' }}
                    </span>
                  </td>
                  <td class="px-4 py-2">
                    <div class="flex gap-2">
                      <button (click)="generateCode(rule)" class="text-green-600 hover:text-green-800 text-sm">
                        生成
                      </button>
                      <button (click)="openEditModal(rule)" class="text-primary-600 hover:text-primary-800 text-sm">
                        编辑
                      </button>
                      <button (click)="resetSequence(rule)" class="text-orange-600 hover:text-orange-800 text-sm">
                        重置
                      </button>
                      <button (click)="deleteRule(rule)" class="text-red-600 hover:text-red-800 text-sm">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    暂无编码规则
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- 生成结果弹窗 -->
      @if (showGenerateModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold text-gray-800">生成编码</h2>
            </div>
            <div class="p-4">
              <div class="text-center">
                <div class="text-sm text-gray-600 mb-2">生成的编码：</div>
                <div class="text-2xl font-mono font-bold text-primary-600">{{ generatedCode() }}</div>
              </div>
            </div>
            <div class="p-4 border-t flex justify-end gap-2">
              <button (click)="closeGenerateModal()" class="btn-primary">关闭</button>
            </div>
          </div>
        </div>
      }

      <!-- 新建/编辑弹窗 -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold text-gray-800">{{ editingRule() ? '编辑规则' : '新建规则' }}</h2>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">规则编码 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.ruleCode"
                  [disabled]="!!editingRule()"
                  class="input-field w-full"
                  placeholder="如：SO,PO,AR"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">规则名称 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.ruleName"
                  class="input-field w-full"
                  placeholder="如：销售订单编号"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">前缀</label>
                <input
                  type="text"
                  [(ngModel)]="formData.prefix"
                  class="input-field w-full"
                  placeholder="如：SO-"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">日期格式</label>
                <select [(ngModel)]="formData.dateFormat" class="input-field w-full">
                  <option value="YYYYMMDD">YYYYMMDD</option>
                  <option value="YYYYMMDDHHmmss">YYYYMMDDHHmmss</option>
                  <option value="YYYYMM">YYYYMM</option>
                  <option value="YYYY">YYYY</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">序号长度</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.sequenceLength"
                    class="input-field w-full"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">序号步长</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.sequenceStep"
                    class="input-field w-full"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">重置规则</label>
                <div class="flex gap-4">
                  <label class="flex items-center">
                    <input type="checkbox" [(ngModel)]="formData.resetDaily" class="mr-2" />
                    每日重置
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" [(ngModel)]="formData.resetMonthly" class="mr-2" />
                    每月重置
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" [(ngModel)]="formData.resetYearly" class="mr-2" />
                    每年重置
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  [(ngModel)]="formData.description"
                  rows="2"
                  class="input-field w-full"
                  placeholder="请输入规则描述"
                ></textarea>
              </div>
            </div>
            <div class="p-4 border-t flex justify-end gap-2">
              <button (click)="closeModal()" class="btn-secondary">取消</button>
              <button (click)="saveRule()" class="btn-primary">保存</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeRuleListComponent implements OnInit {
  private systemService = inject(SystemService);

  codeRules = signal<CodeRule[]>([]);
  showModal = signal(false);
  showGenerateModal = signal(false);
  editingRule = signal<CodeRule | null>(null);
  generatedCode = signal('');

  formData: any = {};

  ngOnInit(): void {
    this.loadCodeRules();
  }

  loadCodeRules(): void {
    this.systemService.getCodeRules().subscribe({
      next: (result: any) => {
        this.codeRules.set(result.data || []);
      },
      error: (err) => console.error('加载编码规则失败', err)
    });
  }

  getDateFormatLabel(format: string): string {
    const labels: Record<string, string> = {
      'YYYYMMDD': '年月日(YYYYMMDD)',
      'YYYYMMDDHHmmss': '完整时间',
      'YYYYMM': '年月(YYYYMM)',
      'YYYY': '年(YYYY)'
    };
    return labels[format] || format;
  }

  openCreateModal(): void {
    this.editingRule.set(null);
    this.formData = {
      ruleCode: '',
      ruleName: '',
      prefix: '',
      dateFormat: 'YYYYMMDD',
      sequenceLength: 4,
      sequenceStep: 1,
      resetDaily: false,
      resetMonthly: false,
      resetYearly: false,
      description: ''
    };
    this.showModal.set(true);
  }

  openEditModal(rule: CodeRule): void {
    this.editingRule.set(rule);
    this.formData = { ...rule };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingRule.set(null);
  }

  closeGenerateModal(): void {
    this.showGenerateModal.set(false);
    this.generatedCode.set('');
  }

  saveRule(): void {
    if (!this.formData.ruleCode || !this.formData.ruleName) {
      alert('请填写必填项');
      return;
    }

    if (this.editingRule()) {
      this.systemService.updateCodeRule(this.editingRule()!.id, this.formData).subscribe({
        next: () => {
          this.loadCodeRules();
          this.closeModal();
        },
        error: (err) => console.error('更新规则失败', err)
      });
    } else {
      this.systemService.createCodeRule(this.formData).subscribe({
        next: () => {
          this.loadCodeRules();
          this.closeModal();
        },
        error: (err) => console.error('创建规则失败', err)
      });
    }
  }

  generateCode(rule: CodeRule): void {
    this.systemService.generateCode(rule.id).subscribe({
      next: (result: any) => {
        this.generatedCode.set(result.data.code);
        this.showGenerateModal.set(true);
        this.loadCodeRules();
      },
      error: (err) => console.error('生成编码失败', err)
    });
  }

  resetSequence(rule: CodeRule): void {
    if (confirm(`确定要重置规则 "${rule.ruleName}" 的序号吗？`)) {
      this.systemService.resetCodeRuleSequence(rule.id).subscribe({
        next: () => {
          this.loadCodeRules();
        },
        error: (err) => console.error('重置序号失败', err)
      });
    }
  }

  deleteRule(rule: CodeRule): void {
    if (confirm(`确定要删除规则 "${rule.ruleName}" 吗？`)) {
      this.systemService.deleteCodeRule(rule.id).subscribe({
        next: () => this.loadCodeRules(),
        error: (err) => console.error('删除规则失败', err)
      });
    }
  }
}
