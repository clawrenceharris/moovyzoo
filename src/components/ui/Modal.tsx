import {
  CSSProperties,
  forwardRef,
  useEffect,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
} from "./";

export interface ModalProps {
  onClose?: () => void;
  headerRight?: ReactNode;
  children?: ReactNode;
  contentStyle?: CSSProperties;
  title: string;
  isOpen?: boolean;
  description?: string;
}
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ contentStyle, title, isOpen, onClose, description, children }, ref) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent style={contentStyle} ref={ref} className="sm:max-w-md">
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          {children}
        </DialogContent>
      </Dialog>
    );
  }
);
