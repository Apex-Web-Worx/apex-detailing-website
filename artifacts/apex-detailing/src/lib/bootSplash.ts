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

/**
 * First viewport content is decoded (hero on home, or route shell elsewhere).
 * Splash stays up until this fires so visitors never see a half-loaded page.
 */
export function markContentReady() {
  bootApi().__APEX_MARK_CONTENT_READY__?.();
}
