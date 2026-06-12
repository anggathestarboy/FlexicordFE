export interface WarningRequest {
  reason: string;
  notes?: string | null;
}

export interface WarningResponse {
  message: string;
}
