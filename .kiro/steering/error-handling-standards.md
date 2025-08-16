# Error Handling Standards – Surfboard

## Goal

Centralize all error handling so Supabase, Zod, and custom app errors map to a consistent `AppErrorCode` enum and friendly, on-brand user messages.

## Rules

- All errors returned to UI must be:
  - Mapped to an `AppErrorCode` enum value
  - Converted into a `{ title, message }` pair from the central `errorMap` in `error-map.ts`
  - Limited to ≤140 characters for the message
- No raw Supabase/Zod error messages shown to the user
- Tone: slightly funny/informal but still concise, action-oriented, and compassionate matching app's style. The app uses a cute monkey as its logo so error messages should sound like they are coming from the monkey.
- Logging: capture raw error + normalized code; never log sensitive info
- Envelope format for Functions/API: `{ ok:false, code, message }`

## Components

- `error-codes.ts` – Enum of all app error codes
- `error-map.ts` – Mapping of codes to `{ title, message }` (ALWAYS use this for user messages)
- `normalize-error.ts` – Functions to map Supabase and Zod errors to codes, and retrieve messages from errorMap
- Unit tests to ensure correct mapping and output
- useErrorHandler hook for handling errors and outputing the right error from the error map

## Implementation Rules

- **ALWAYS** use `errorMap[code]` from `error-map.ts` for user-facing messages
- **NEVER** show raw error messages to users
- All services must normalize errors to `AppErrorCode` before returning
- All hooks must use `errorMap` to get user-friendly messages
- Log original errors in development, normalized errors in production
