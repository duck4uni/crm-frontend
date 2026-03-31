import { cn } from "@/lib/utils";

export function Spinner({
  size = "md",
  className
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin",
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" />
    </div>
  );
}

export function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner size="md" />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}
