export const isLocalClerkBypassEnabled =
  process.env.NODE_ENV === 'development' && process.env.LOCAL_CLERK_BYPASS === 'true'
