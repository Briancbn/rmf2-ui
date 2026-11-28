import { LauncherConfig, RTOConfig } from '@/clients';

async function sendToEndpoint(base: string) {
  // TODO(anyone): fix response header to remove the try-catch
  try {
    await fetch(base + '/send_task', {
      method: 'POST',
      headers: { Accept: '*' },
    });
  } catch (e) {
    console.error(e);
  }
}

export async function sendPresetTask() {
  await sendToEndpoint(LauncherConfig.BASE);
  await sendToEndpoint(RTOConfig.BASE);
  await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
}
