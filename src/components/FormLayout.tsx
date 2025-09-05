import { useEffect, type ReactNode } from "react";
import {
  useForm,
  type UseFormProps,
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
  Resolver,
} from "react-hook-form";
import { Button } from "./ui";
import { Form, FormDescription, FormMessage } from "./ui/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { normalizeError } from "@/utils/normalize-error";

export interface FormLayoutProps<T extends FieldValues>
  extends UseFormProps<T> {
  children?: ((methods: UseFormReturn<T>) => ReactNode) | ReactNode;
  showsSubmitButton?: boolean;
  showsCancelButton?: boolean;
  submitText?: string;
  cancelText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit?: (data: T) => void | Promise<any>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
  isOpen?: boolean;
  description?: string;
  resolver?: Resolver<T, any, T>;
  descriptionStyle?: React.CSSProperties;
  defaultValues?: DefaultValues<T>;
  enableBeforeUnloadProtection?: boolean;
}

function FormLayout<T extends FieldValues>({
  children,
  showsSubmitButton = true,
  showsCancelButton = false,
  submitText = "Submit",
  cancelText = "Cancel",
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  mode = "onSubmit",
  isOpen = true,
  description,
  descriptionStyle,
  resolver,
  defaultValues,
  enableBeforeUnloadProtection = false,
  ...formProps
}: FormLayoutProps<T>) {
  const form = useForm<T>({
    ...formProps,
    mode,
    resolver,
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);
  useEffect(() => {
    if (!enableBeforeUnloadProtection || !isOpen) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enableBeforeUnloadProtection, isOpen, form.formState.isDirty]);

  const handleSubmit = async (data: T) => {
    if (onSubmit) {
      try {
        await onSubmit(data);
      } catch (error) {
        const normalizedError = normalizeError(error);
        form.setError("root", { message: normalizedError.message });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {description && (
          <FormDescription id="form-description" style={descriptionStyle}>
            {description}
          </FormDescription>
        )}

        <div className="space-y-6">
          {typeof children === "function" ? children(form) : children}

          {error && (
            <div className="flex-1">
              <FormMessage>{error}</FormMessage>
            </div>
          )}
        </div>

        <div>
          {showsCancelButton && (
            <Button type="button" onClick={onCancel} disabled={isLoading}>
              {cancelText}
            </Button>
          )}

          {showsSubmitButton && (
            <Button type="submit" variant={"primary"} size={"lg"}>
              <span className="flex items-center gap-2">
                {isLoading && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {isLoading ? "Loading..." : submitText}
              </span>
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

export default FormLayout;
