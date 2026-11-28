// TODO(anyone): add fields for other action types (e.g. task, process, edge payloads)
export interface ScheduleAction {
  type: string;
  id?: string;
  node_id?: string;
  source_id?: string;
  destination_id?: string;
  edge_type?: string;
}
