# Form Standards and Architecture

## CRITICAL REQUIREMENT: ALL FORMS MUST USE FormLayout

**Every form in the application MUST use the `FormLayout` wrapper component.** This is non-negotiable for consistency, validation, and error handling.

We are standardizing all forms to use **React Hook Form** (`react-hook-form`) with **Zod** validation to ensure consistent validation, error handling, and submission patterns across the application.

## Core Components

### FormLayout (MANDATORY WRAPPER)

- **`FormLayout`** (in `components/forms/FormLayout.tsx`)
  - **REQUIRED**: Every form must be wrapped in this component
  - Wraps all form content in `Form` component from Shadcn UI
  - Handles submission, default values, and optional description text
  - Provides a single place to manage form-level UI (submit/cancel buttons, loading states, error banners)
  - Uses Shadcn UI `Form` component internally for consistent styling

### Feature-Specific Form Components

- **Feature-specific form components** (e.g., `LoginForm`, `SignupForm`)
  - Children of `FormLayout` that render only the field UI
  - Use `useFormContext()` to access `register`, `errors`, and other RHF methods
  - Do not contain their own `<form>` tags or submit logic
  - Must use Shadcn UI form components (Input, Label, Button, etc.)

### Validation Schemas

- **Validation Schemas**
  - Defined using Zod (`.ts` files ending in `.schema.ts`)
  - Provide both runtime validation and TypeScript types for form data

## Key Guidelines

1. **MANDATORY FormLayout wrapper**  
   Every single form must be wrapped in `FormLayout`. No exceptions. This ensures consistent validation, error handling, and UI patterns.

2. **MANDATORY Shadcn UI components**  
   All form inputs must use Shadcn UI components (Input, Label, Button, Textarea, Select, etc.). Never use raw HTML form elements.

3. **No manual `useState` for form fields**  
   All form data must come from `useFormContext()` to ensure consistency and prevent duplication of validation logic.

4. **Validation-first**  
   All forms must use Zod schemas with `zodResolver` for validation. This ensures that:

   - Validation errors appear automatically in `formState.errors`
   - TypeScript infers the form type from the schema

5. **Server errors**  
   API or authentication errors should be caught in the page or hook (`useAuth`, etc.) and passed down to the form component as a prop (`authError`, etc.).

6. **Form reusability**  
   Keep business logic (e.g., calling Supabase, fetching data) in higher level components or hooks like `useLogin` or in the page component, not inside the form UI component.

7. **Default values**  
   Pass any `defaultValues` to `FormLayout` so that form fields are pre-populated and reset correctly.

8. **Before unload protection**  
   `FormLayout` has optional `enableBeforeUnloadProtection` to prevent accidental navigation away from dirty forms.

## Example Usage

### Correct Implementation (REQUIRED)

```tsx
import { FormLayout } from "@/components/forms/FormLayout";
import { Input, Label, Button } from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ CORRECT: Using FormLayout wrapper with Shadcn UI components
<FormLayout<LoginFormData>
  resolver={zodResolver(loginSchema)}
  defaultValues={{ email: "", password: "" }}
  onSubmit={(data) => login(data)}
>
  <LoginForm
    onForgotPassword={(email) => triggerPasswordReset(email)}
    onSwitchToSignup={() => router.push("/signup")}
  />
</FormLayout>;

// Inside LoginForm component:
function LoginForm({ onForgotPassword, onSwitchToSignup }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-error-status text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </>
  );
}
```

### Incorrect Implementation (FORBIDDEN)

```tsx
// ❌ WRONG: No FormLayout wrapper
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// ❌ WRONG: Using raw HTML elements instead of Shadcn UI
function BadForm() {
  return (
    <FormLayout>
      <input type="text" /> {/* Should be <Input /> */}
      <button>Submit</button> {/* Should be <Button /> */}
    </FormLayout>
  );
}
```

## Installation Requirements

Before creating any form, ensure Shadcn UI form components are installed:

```bash
npx shadcn@latest add form input label button textarea select
```
