export interface ScheduleAction {
  type: string;
  id?: string;
  node_id?: string;
  source_id?: string;
  destination_id?: string;
  edge_type?: string;
}
