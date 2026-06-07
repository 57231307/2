import { format } from 'date-fns';

/**
 * 生成带日期的编码
 * 格式：{prefix}-YYYYMMDD-XXXX
 * @param prefix 前缀
 * @param date 日期，默认为当前日期
 * @returns 生成的编码
 */
export function generateCode(prefix: string, date: Date = new Date()): string {
  const dateStr = format(date, 'yyyyMMdd');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${dateStr}-${random}`;
}

/**
 * 生成缸号（生产批次号）
 * 格式：GD-YYYYMMDD-XXX
 * @param date 日期，默认为当前日期
 * @returns 生成的缸号
 */
export function generateBatchNo(date: Date = new Date()): string {
  const dateStr = format(date, 'yyyyMMdd');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `GD-${dateStr}-${random}`;
}

/**
 * 生成匹号（卷号）
 * 格式：P-XXX
 * @param sequence 序号
 * @returns 生成的匹号
 */
export function generateRollNo(sequence: number): string {
  return `P-${sequence.toString().padStart(3, '0')}`;
}

/**
 * 编码生成器类
 * 提供各种业务编码的生成方法
 */
export class CodeGenerator {
  private static sequence = 0;

  /**
   * 生成订单编号
   * 格式：{prefix}-YYYYMMDD-XXXX
   * @param prefix 前缀
   * @returns 生成的订单编号
   */
  static async generateOrderNo(prefix: string): Promise<string> {
    const dateStr = format(new Date(), 'yyyyMMdd');
    this.sequence = (this.sequence + 1) % 10000;
    const seq = this.sequence.toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${seq}`;
  }

  /**
   * 生成缸号
   * 格式：GD-YYYYMMDD-XXX
   * @returns 生成的缸号
   */
  static async generateBatchNo(): Promise<string> {
    return generateBatchNo();
  }

  /**
   * 生成匹号
   * @param sequence 序号，默认为自增序号
   * @returns 生成的匹号
   */
  static async generateRollNo(sequence?: number): Promise<string> {
    if (sequence !== undefined) {
      return generateRollNo(sequence);
    }
    this.sequence = (this.sequence + 1) % 1000;
    return generateRollNo(this.sequence);
  }
}
