import { BatchStatus, QualityStatus } from '../../shared/enums/batch.enum';

export interface InventoryBatch {
  id: string;
  batchCode: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  colorVariantId: string;
  colorCode: string;
  colorName: string;
  dyeLotNo: string;
  pieceNo: string;
  quantity: number;
  unit: string;
  status: BatchStatus;
  qualityStatus: QualityStatus;
  inboundTime: Date;
  productionDate?: Date;
  expiryDate?: Date;
}

export interface InboundRequest {
  batchId: string;
  warehouseId: string;
  dyeLotNo: string;
  pieceNo: string;
  quantity: number;
  qualityStatus: QualityStatus;
  inboundTime: Date;
  productionDate?: Date;
}

export interface OutboundRequest {
  batchId: string;
  quantity: number;
  destination: string;
  outboundTime: Date;
}

export interface InventoryQueryParams {
  warehouseId?: string;
  productId?: string;
  colorVariantId?: string;
  dyeLotNo?: string;
  pieceNo?: string;
  enableWarning?: boolean;
}
