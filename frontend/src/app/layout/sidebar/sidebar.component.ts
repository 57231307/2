import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="bg-white border-r border-gray-200 transition-all duration-300 flex flex-col"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <!-- Logo区域 -->
      <div class="h-16 flex items-center justify-center border-b border-gray-200">
        @if (!collapsed()) {
          <span class="text-lg font-semibold text-primary-600">面料ERP</span>
        } @else {
          <span class="text-lg font-semibold text-primary-600">E</span>
        }
      </div>

      <!-- 菜单 -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-2">
          @for (item of menuItems; track item.path) {
            <li>
              @if (item.children && item.children.length > 0) {
                <div
                  class="text-gray-500 text-xs uppercase tracking-wider px-3 py-2"
                  [class.text-center]="collapsed()"
                >
                  {{ collapsed() ? item.icon : item.label }}
                </div>
              } @else {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-primary-50 text-primary-600"
                  [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
                  class="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  [class.justify-center]="collapsed()"
                  [title]="collapsed() ? item.label : ''"
                >
                  <span class="text-lg">{{ item.icon }}</span>
                  @if (!collapsed()) {
                    <span>{{ item.label }}</span>
                  }
                </a>
              }
            </li>
          }
        </ul>
      </nav>

      <!-- 折叠按钮 -->
      <div class="border-t border-gray-200 p-2">
        <button
          (click)="toggleCollapse.emit()"
          class="w-full flex items-center justify-center py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span class="text-lg">{{ collapsed() ? '→' : '←' }}</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  toggleCollapse = output<void>();

  menuItems: MenuItem[] = [
    { label: '工作台', icon: '🏠', path: '/dashboard' },
    { label: '产品管理', icon: '📦', path: '/product' },
    { label: '库存管理', icon: '📊', path: '/inventory' },
    { label: '销售管理', icon: '💰', path: '/sales' },
    { label: '采购管理', icon: '🛒', path: '/purchase' },
    { label: '生产管理', icon: '🏭', path: '/production' },
    { label: '质量管理', icon: '✅', path: '/quality' },
    { label: '财务管理', icon: '💳', path: '/finance' },
    { label: '客户管理', icon: '👥', path: '/customer' },
    { label: '供应商管理', icon: '🏢', path: '/supplier' },
    { label: '花型管理', icon: '🎨', path: '/pattern' },
    { label: '颜色配方', icon: '🌈', path: '/color-formula' },
  ];
}
