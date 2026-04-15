import { actionLogsApi, errorLogsApi } from "@/lib/api/services";

export const logsService = {
  action: actionLogsApi,
  error: errorLogsApi,
};