import {
  Children,
  isValidElement,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react"
import { Avatar as ShadAvatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge as ShadBadge } from "@/components/ui/badge"
import { Button as ShadButton } from "@/components/ui/button"
import { Card as ShadCard } from "@/components/ui/card"
import {
  Dialog as ShadDialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input as ShadInput } from "@/components/ui/input"
import { Label as ShadLabel } from "@/components/ui/label"
import { Progress as ShadProgress } from "@/components/ui/progress"
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton as ShadSkeleton } from "@/components/ui/skeleton"
import { Textarea as ShadTextarea } from "@/components/ui/textarea"
import { cn } from "../lib/utils"

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "icon"
}) {
  return (
    <ShadButton
      className={className}
      variant={variant}
      size={size}
      {...props}
    />
  )
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <ShadInput className={className} {...props} />
}

type SelectOption = { value: string label: ReactNode }

export function Select({
  className,
  children,
  value,
  defaultValue,
  onChange,
  disabled,
}: {
  className?: string
  children: ReactNode
  value?: string
  defaultValue?: string
  onChange?: (event: { target: { value: string } }) => void
  disabled?: boolean
}) {
  const options: SelectOption[] = []
  Children.forEach(children, (child) => {
    if (isValidElement<{ value?: string children?: ReactNode }>(child)) {
      const label = child.props.children
      const stringLabel =
        typeof label === "string" || typeof label === "number"
          ? String(label)
          : ""
      options.push({ value: child.props.value ?? stringLabel, label })
    }
  })
  const placeholder = options[0]?.label
  return (
    <ShadSelect
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onChange?.({ target: { value: next } })}
      disabled={disabled}
    >
      <SelectTrigger className={cn("min-w-38", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem value={option.value} key={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadSelect>
  )
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <ShadTextarea className={className} {...props} />
}

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <ShadCard className={cn("gap-0 py-0", className)}>{children}</ShadCard>
}

export function Badge({
  children,
  variant = "outline",
}: {
  children: ReactNode
  variant?: "outline" | "solid" | "muted"
}) {
  return (
    <ShadBadge
      variant={
        variant === "solid"
          ? "default"
          : variant === "muted"
            ? "secondary"
            : "outline"
      }
    >
      {children}
    </ShadBadge>
  )
}

export function Avatar({
  initials,
  size = "md",
}: {
  initials: string
  size?: "sm" | "md" | "lg"
}) {
  return (
    <ShadAvatar
      className={cn(
        size === "sm" && "size-7",
        size === "md" && "size-9",
        size === "lg" && "size-12",
      )}
    >
      <AvatarFallback>{initials}</AvatarFallback>
    </ShadAvatar>
  )
}

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode
  htmlFor?: string
  hint?: string
}) {
  return (
    <ShadLabel className="flex justify-between" htmlFor={htmlFor}>
      <span>{children}</span>
      {hint && (
        <span className="font-normal text-muted-foreground">{hint}</span>
      )}
    </ShadLabel>
  )
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <ShadDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn(
          "max-h-[calc(100vh-2rem)] overflow-y-auto",
          wide && "sm:max-w-2xl",
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </ShadDialog>
  )
}

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string
  children: ReactNode
  hint?: string
  error?: string
}) {
  return (
    <div className="field">
      <Label hint={hint}>{label}</Label>
      {children}
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}

export function Progress({ value }: { value: number }) {
  return <ShadProgress value={Math.max(0, Math.min(100, value))} />
}

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Active" || status === "Approved" || status === "Hired"
      ? "solid"
      : status === "Pending" || status === "On Leave" || status === "Screening"
        ? "outline"
        : "muted"
  return <Badge variant={variant}>{status}</Badge>
}

export function Skeleton({ className }: { className?: string }) {
  return <ShadSkeleton className={className} />
}
