# Error Handling Standards – Zoovie

## Goal

Centralize all error handling so Supabase, Zod, and custom app errors map to a consistent `AppErrorCode` enum and friendly, on-brand user messages.

## Rules

- All errors returned to UI must be:
  - Mapped to an `AppErrorCode` enum value
  - Converted into a `{ title, message }` pair from the central `errorMap` in `error-map.ts`
  - Limited to ≤140 characters for the message
- No raw Supabase/Zod error messages shown to the user
- Tone: witty but still concise, action-oriented, and compassionate, matching app's style.
- Logging: capture raw error + normalized code; never log sensitive info
- Envelope format for Functions/API: `{ ok:false, code, message }`

## Components

- `error-codes.ts` – Enum of all app error codes
- `error-map.ts` – Mapping of codes to `{ title, message }` (ALWAYS use this for user messages)
- `normalize-error.ts` – Functions to map Supabase and Zod errors to codes, and retrieve messages from errorMap
- Unit tests to ensure correct mapping and output
- useErrorHandler hook for handling errors and outputing the right error from the error map
