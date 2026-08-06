"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// This app has no light-mode support — it's permanently dark-themed via
// custom Tailwind color tokens, not next-themes/Tailwind's dark: variant
// system (no ThemeProvider is mounted anywhere). Hardcoding "dark" here
// instead of theme="system" avoids sonner falling back to the OS-level
// prefers-color-scheme and rendering light-mode toasts on top of this UI.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
