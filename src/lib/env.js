// Treat empty or "REPLACE_ME..." placeholder values (as set in Vercel) as unset.
export const env = (k) => { const v = import.meta.env[k]; return v && !String(v).startsWith('REPLACE') ? v : '' }
