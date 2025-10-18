const URL_GET_TASKS: string =
  'http://localhost:8089/schedule/?offset=0&limit=100';
const URL_SEND_JOBS: string = 'http://localhost:8083/send_jobs';

// Function to fetch all tasks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAllTasks(): Promise<any[]> {
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

// Function to send jobs (POST request)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendJobs(jobData: any = {}): Promise<any> {
  try {
    const response = await fetch(URL_SEND_JOBS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Assuming it's a JSON API
      },
      body: JSON.stringify(jobData), // Sending job data as the body of the request
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error sending jobs:', err);
    return null; // Return null in case of error
  }
}
