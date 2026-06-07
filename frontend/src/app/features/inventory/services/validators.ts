import { Injectable, inject } from '@angular/core';
import { InventoryService } from './inventory.service';
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, debounceTime, map, switchMap, of, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PieceNoValidator {
  private inventoryService = inject(InventoryService);

  createValidator(excludeBatchId?: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return of(control.value).pipe(
        debounceTime(300),
        switchMap((pieceNo: string) => {
          const dyeLotNo = control.parent?.get('dyeLotNo')?.value;
          if (!dyeLotNo) {
            return of(null);
          }
          return this.inventoryService.checkPieceNoUnique(dyeLotNo, pieceNo, excludeBatchId).pipe(
            map((isUnique: boolean) => isUnique ? null : { notUnique: true }),
            catchError(() => of(null))
          );
        })
      );
    };
  }
}

export function generateDyeLotNo(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `D${year}${month}${day}${random}`;
}

export function generatePieceNo(): string {
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `P${random}`;
}

export function generateBatchCode(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `B${year}${month}${day}${random}`;
}
