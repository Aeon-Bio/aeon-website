// rendered per request (not prerendered): '/' must reach hooks.server.ts so the
// Accept-Language redirect and the ?lang= cookie can run; a static '/' would bypass them
export const prerender = false;
