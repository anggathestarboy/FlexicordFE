export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  tier: string;
  condition_type: string;
  condition_value: number;
  created_at: string;
}

export interface BadgesApiResponse {
  success: boolean;
  data: Badge[];
}

export interface BadgesSuccessResponse {
  success: true;
  data: Badge[];
}

export interface BadgesErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export type BadgesResponse = BadgesSuccessResponse | BadgesErrorResponse;