---
description: Code examples for Frontend components and data fetching.
globs: apps/web/**/*.{ts,tsx}
---
# Frontend Examples (前端示例)

## Component with Tailwind & Props
```tsx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md",
        variant === "primary" ? "bg-blue-600" : "bg-gray-200",
        className
      )}
      {...props}
    />
  );
}
```

## Data Fetching
```tsx
// ✅ Good: Use Query
const { data, isLoading } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos
});
```
