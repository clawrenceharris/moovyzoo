"use client";
import { useEffect, type ReactNode } from "react";
import {
  useForm,
  type UseFormProps,
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
  Resolver,
} from "react-hook-form";
import { Button } from "../ui";
import { Form, FormDescription, FormMessage } from "../ui/form";
import { getUserErrorMessage, normalizeError } from "@/utils/normalize-error";

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
  resolver: Resolver<T, any, T>;
  descriptionStyle?: React.CSSProperties;
  defaultValues?: DefaultValues<T>;
  enableBeforeUnloadProtection?: boolean;
}

export function FormLayout<T extends FieldValues>({
  children,
  showsSubmitButton = true,
  showsCancelButton = true,
  submitText = "Done",
  cancelText = "Cancel",
  onSubmit,
  onCancel,
  resolver,
  isLoading = false,
  error,
  mode = "onSubmit",
  isOpen = true,
  description,
  descriptionStyle,
  enableBeforeUnloadProtection = false,
  ...formProps
}: FormLayoutProps<T>) {
  const form = useForm<T>({
    ...formProps,
    resolver,
    mode,
  });

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
    try {
      await onSubmit?.(data);
    } catch (error) {
      console.error(error);
      form.setError("root", { message: getUserErrorMessage(error) });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {description && (
          <FormDescription style={descriptionStyle}>
            {description}
          </FormDescription>
        )}

        <div className="space-y-6">
          {/* General Error */}
          {form.formState.errors.root && (
            <div className="p-3 text-sm text-red-600 bg-red-500/20 border border-red-500 rounded-md">
              <FormMessage>{form.formState.errors.root.message} </FormMessage>
            </div>
          )}
          {typeof children === "function" ? children(form) : children}
        </div>

        <div className="justify-end flex items-center">
          {showsCancelButton && (
            <Button
              variant={"ghost"}
              type="button"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}

          {showsSubmitButton && (
            <Button
              onClick={() => console.log("onsubmit")}
              type="submit"
              variant={"primary"}
              size={"lg"}
            >
              {isLoading ? (
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
              ) : (
                submitText
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
