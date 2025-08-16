# Tech Steering – MoovyZoo

## Stack

- Frontend: Next.js + TypeScript + Tailwind
- Backend: Supabase
  - Auth: Supabse Authentication (email/password for MVP)
  - Data: Supabase (social data), Realtime Database (presence + party sync) + TMDB (Movie Data)
  - Storage: Supabase Storage for media
- State: TanStack Query or direct listeners (hook wrappers)
- Tests: Vitest (unit)
- Deploy: Vercel

# Form Architecture

We are standardizing all forms to use **React Hook Form** (`react-hook-form`) with **Zod** validation to ensure consistent validation, error handling, and submission patterns across the application.

## Core Components

- **`FormLayout`** (in `components/forms/FormLayout.tsx`)
  - Wraps all form content in `FormProvider` and `<form>` element.
  - Handles submission, default values, and optional description text.
  - Provides a single place to manage form-level UI (submit/cancel buttons, loading states, error banners).
- **Feature-specific form components** (e.g., `LoginForm`, `SignupForm`)
  - Children of `FormLayout` that render only the field UI.
  - Use `useFormContext()` to access `register`, `errors`, and other RHF methods.
  - Do not contain their own `<form>` tags or submit logic.
- **Validation Schemas** (in `features/{featureName}/types/`)
  - Defined using Zod (`.ts` files ending in `.schema.ts` or `.types.ts`).
  - Provide both runtime validation and TypeScript types for form data.
- **Optional RHFInput helper**
  - Abstracts the `label`, `input`, and `error` glue for common text/number/email fields.

## Key Guidelines

1. **No manual `useState` for form fields**  
   All form data must come from `useFormContext()` to ensure consistency and prevent duplication of validation logic.
2. **Validation-first**  
   All forms must use Zod schemas with `zodResolver` for validation. This ensures that:
   - Validation errors appear automatically in `formState.errors`.
   - TypeScript infers the form type from the schema.
3. **Server errors**  
   API or authentication errors should be caught in the page or hook (`useAuth`, etc.) and passed down to the form component as a prop (`authError`, etc.).
4. **Form reusability**  
   Keep business logic (e.g., calling Supabase, fetching data) in higher level components or hooks like `useLogin` or in the page component, not inside the form UI component.
5. **Default values**  
   Pass any `defaultValues` to `FormLayout` so that form fields are pre-populated and reset correctly.
6. **Before unload protection**  
   `FormLayout` has optional `enableBeforeUnloadProtection` to prevent accidental navigation away from dirty forms.

## Example Usage

```tsx
<FormLayout<LoginFormData>
  resolver={zodResolver(LoginSchema)}
  defaultValues={{ email: "", password: "" }}
  onSubmit={(data) => login(data)}
>
  <LoginForm
    onForgotPassword={(email) => triggerPasswordReset(email)}
    onSwitchToSignup={() => router.push("/signup")}
  />
</FormLayout>
```
