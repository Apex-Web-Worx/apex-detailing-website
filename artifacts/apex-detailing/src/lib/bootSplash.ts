/**
 * Critical first-viewport media used to gate the splash.
 * Photos no longer block entry — kept as a no-op-compatible API.
 */
type ApexBootApi = {
  __APEX_MARK_APP_READY__?: () => void;
  __APEX_MARK_CONTENT_READY__?: () => void;
};

function bootApi(): ApexBootApi {
  return window as Window & ApexBootApi;
}

/** React tree has painted (CSS/JS mounted). */
export function markAppReady() {
  bootApi().__APEX_MARK_APP_READY__?.();
}

/** @deprecated Photos use LQIP and no longer gate the splash. */
export function markContentReady() {
  bootApi().__APEX_MARK_CONTENT_READY__?.();
}
