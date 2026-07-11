/**
 * Order Validation Service
 * Handles validation of incoming orders to ensure data integrity
 * and prevent invalid entries from reaching the database.
 */

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  discountCode?: string | null;
  createdAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class OrderValidator {
  /**
   * Validates an order structure and its values against business rules.
   * Fixes edge cases where empty items, negative prices, or invalid emails
   * were previously causing unhandled failures or schema mismatches.
   */
  public static validate(order: Partial<Order>): ValidationResult {
    const errors: string[] = [];

    if (!order) {
      return { isValid: false, errors: ["Order data is missing"] };
    }

    if (!order.id || typeof order.id !== "string" || order.id.trim() === "") {
      errors.push("Invalid or missing Order ID");
    }

    if (!order.customerEmail || typeof order.customerEmail !== "string") {
      errors.push("Customer email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(order.customerEmail)) {
        errors.push("Invalid email format");
      }
    }

    if (!order.items || !Array.isArray(order.items)) {
      errors.push("Order items must be a non-empty array");
    } else if (order.items.length === 0) {
      errors.push("Order must contain at least one item");
    } else {
      order.items.forEach((item, index) => {
        if (!item || typeof item !== "object") {
          errors.push(`Item at index ${index} is invalid`);
          return;
        }
        if (!item.id || typeof item.id !== "string") {
          errors.push(`Item at index ${index} is missing a valid ID`);
        }
        if (!item.name || typeof item.name !== "string") {
          errors.push(`Item at index ${index} is missing a valid name`);
        }
        if (typeof item.quantity !== "number" || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          errors.push(`Item at index ${index} must have a positive integer quantity`);
        }
        if (typeof item.price !== "number" || item.price < 0) {
          errors.push(`Item at index ${index} cannot have a negative price`);
        }
      });
    }

    if (typeof order.totalAmount !== "number" || order.totalAmount < 0) {
      errors.push("Total amount must be a non-negative number");
    } else if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      const calculatedTotal = order.items.reduce((sum, item) => {
        const itemPrice = typeof item?.price === "number" ? item.price : 0;
        const itemQty = typeof item?.quantity === "number" ? item.quantity : 0;
        return sum + (itemPrice * itemQty);
      }, 0);

      if (Math.abs(calculatedTotal - order.totalAmount) > 0.01) {
        errors.push(`Total amount mismatch. Expected: ${calculatedTotal.toFixed(2)}, Received: ${order.totalAmount.toFixed(2)}`);
      }
    }

    if (order.discountCode !== undefined && order.discountCode !== null) {
      if (typeof order.discountCode !== "string" || order.discountCode.trim() === "") {
        errors.push("Discount code must be a non-empty string or null");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}