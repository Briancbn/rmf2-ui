import { RTSConfig } from '@/clients';

// Function to fetch all tasks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAllTasks(): Promise<any[]> {
  const URL_GET_TASKS: string =
    RTSConfig.BASE + '/schedule/?offset=0&limit=100';
  try {
    const response = await fetch(URL_GET_TASKS);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    //console.log('data',data.tasks)
    return data.tasks || []; // Ensure we return tasks (if present) or an empty array
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return [];
  }
}
