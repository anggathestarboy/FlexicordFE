export interface SelfWarning {
  id: string;
  moderator_id: string;
  target_user_id: string;
  action_type: string;
  reason: string;
  notes: string | null;
  created_at: string;
}

export interface SelfWarningResponse {
  message: string;
  data: SelfWarning[];
}
