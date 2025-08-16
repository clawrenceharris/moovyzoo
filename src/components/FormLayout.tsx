import { useEffect, type ReactNode } from "react";
import {
  useForm,
  FormProvider,
  type UseFormProps,
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
} from "react-hook-form";
import { Button } from "./ui";
import { Form } from "./ui/form";

export interface FormLayoutProps<T extends FieldValues>
  extends UseFormProps<T> {
  children?: ((methods: UseFormReturn<T>) => ReactNode) | ReactNode;
  showsSubmitButton?: boolean;
  showsCancelButton?: boolean;
  submitText?: string;
  cancelText?: string;
  onSubmit?: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
  isOpen?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  description?: string;
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
  disabled = false,
  style,
  description,
  descriptionStyle,
  defaultValues,
  enableBeforeUnloadProtection = false,
  ...formProps
}: FormLayoutProps<T>) {
  const form = useForm<T>({
    ...formProps,
    mode,
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
        console.error("Form submission error:", error);
      }
    }
  };

  return (
    <FormProvider<T> {...form}>
      <Form
        {...form}
        handleSubmit={() => form.handleSubmit(handleSubmit)}
        aria-describedby={description ? "form-description" : undefined}
      >
        {description && (
          <p id="form-description" style={descriptionStyle}>
            {description}
          </p>
        )}

        <div className="space-y-4">
          {typeof children === "function" ? children(form) : children}

          {error && (
            <div role="alert" aria-live="polite">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          {showsCancelButton && (
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              // className={cn(
              //   "btn btn-secondary",
              //   "focus:ring-2 focus:ring-[--color-dark-border-primary] focus:ring-offset-2",
              //   "focus:ring-offset-[--color-dark-bg-secondary]",
              //   "disabled:opacity-50 disabled:cursor-not-allowed",
              //   "transition-all duration-200"
              // )}
            >
              {cancelText}
            </Button>
          )}

          {showsSubmitButton && (
            <Button type="submit" disabled={isLoading || disabled}>
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
      </Form>
    </FormProvider>
  );
}

export default FormLayout;
