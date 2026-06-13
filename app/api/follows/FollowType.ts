export interface FollowData {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowResponse {
  message: string;
  follow?: FollowData;
}

export interface FollowRequestBody {
  username: string;
}
