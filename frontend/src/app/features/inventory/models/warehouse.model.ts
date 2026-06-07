import { WarehouseType, WarehouseStatus } from '../../shared/enums/warehouse.enum';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: WarehouseType;
  status: WarehouseStatus;
  address?: string;
  manager?: string;
  capacity?: number;
}
