import reportService from './reportService';
import { ApiWrapper } from '../types';

const poll = async (requestId: string, interval = 2000, maxAttempts = 15): Promise<ApiWrapper> => {
  // Polling placeholder: call GET /export/status/:id
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const res = await (reportService as any).getExportStatus?.(requestId);
      if (res && res.success && res.data && res.data.status && res.data.status !== 'processing') {
        return res;
      }
    } catch (e) {
      // ignore and retry
    }
    await new Promise(r => setTimeout(r, interval));
    attempts++;
  }
  return { success: false, message: 'timeout', data: null, errors: ['timeout'] };
};

const exportOrchestrator = {
  async startExport(payload: any) {
    const res = await reportService.export(payload);
    if (!res.success) return res;
    if (res.data && res.data.request_id) {
      const status = await poll(res.data.request_id);
      return status;
    }
    return res;
  }
};

export default exportOrchestrator;

