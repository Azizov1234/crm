const ACCESS_TOKEN_KEY = "academy_access_token";
const BRANCH_ID_KEY = "academy_active_branch_id";

function safeStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getAccessToken() {
  return safeStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function setAccessToken(accessToken: string) {
  const storage = safeStorage();
  if (!storage) return;

  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearAccessToken() {
  const storage = safeStorage();
  if (!storage) return;

  storage.removeItem(ACCESS_TOKEN_KEY);
}

export function getActiveBranchId() {
  return safeStorage()?.getItem(BRANCH_ID_KEY) ?? null;
}

export function setActiveBranchId(branchId: string) {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(BRANCH_ID_KEY, branchId);
}

export function clearActiveBranchId() {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(BRANCH_ID_KEY);
}
