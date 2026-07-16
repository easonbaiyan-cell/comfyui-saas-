export interface Profile {
  id: string;
  points: number;
  inviter_id: string | null;
  created_at: string;
}

export interface VideoTask {
  id: string;
  user_id: string;
  workflow_id: string | null;
  status: 'pending' | 'processing' | 'success' | 'failed';
  input_data: any;
  result_video_url: string | null;
  cost_points: number;
  created_at: string;
}

export interface RechargeOrder {
  id: string;
  user_id: string;
  plan_type: 'base' | 'annual' | 'month' | 'year';
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface Commission {
  id: string;
  inviter_id: string;
  invitee_id: string;
  order_id: string;
  order_amount: number;
  commission_amount: number;
  created_at: string;
}
