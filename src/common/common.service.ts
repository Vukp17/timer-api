import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
  getOrderBy(sortField: string, sortOrder: 'asc' | 'desc') {
    if (!sortField) return undefined;

    const parts = sortField.split('.');
    if (parts.length > 1) {
      const [relation, field] = parts;
      return { [relation]: { [field]: sortOrder } };
    }

    // Handle simple fields
    return { [sortField]: sortOrder };
  }
}
