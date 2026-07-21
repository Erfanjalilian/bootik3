// ============================================================================
// Tapin Shipping API - Compatibility Re-export
// ============================================================================
// This file re-exports everything from the new tapin.service.ts for backward
// compatibility. The actual implementation is in tapin.service.ts.
// ============================================================================

export {
  TapinApiError,
  getTapinShopId,
  calculateShippingCost,
  createShipment,
  getProvinces,
  getCities,
} from "./tapin.service";

export type {
  ShippingCostResult,
  ShipmentResult,
} from "@/lib/types/tapin.types";

export type { TapinProvince, TapinCity } from "@/lib/types/tapin.types";