# Form Standards – Shortened Version

## Core Rules

1. **All forms must use `FormLayout`**

   - Provides consistent validation, error handling, and UI.
   - No raw `<form>` tags.

2. **Use Shadcn UI components + FormLayout**

   - Inputs, Labels, Buttons, Textareas, Selects.
   - Do not use raw HTML form elements.
   - Styles are applied automatically by FormLayout and Shadcn UI
   - Only use these Shadcn components in the child form component: FormField, FormItem, FormLabel, FormMessage, FormDescription, FormControl, Textarea, Select, Input

3. **Validation**

   - Must use Zod schemas with `zodResolver`.
   - Form types inferred from schemas.

4. **Form state**

   - No manual `useState` for fields.
   - Always use `useFormContext()` when necessary.

5. **Error handling**

   - API/auth errors handled in hooks or pages. No error display in forms.
   - Form-level error display handled by `FormLayout`

6. **Separation of concerns**

   - Keep business logic (API calls, Supabase, etc.) out of form UI components.
   - Only field rendering inside feature-specific forms.

7. **Default values**
   - Pass `defaultValues` into `FormLayout` for pre-population if needed.

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

//✅ CORRECT: Inside LoginForm component:
function LoginForm({ onForgotPassword, onSwitchToSignup }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <FormField
        render={() => (

          <FormItem>
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
      </FormItem>
        )}
    </>
  );
}
```

### Incorrect Implementation

```tsx
// ❌ WRONG: No FormLayout wrapper
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
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
```

## Summary

Kiro should never worry about layout, styles or accessibility—`FormLayout` and Shadcn handle this internally. Focus only on consistency, and proper use of form architecture.
