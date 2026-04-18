export default function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="rounded-2xl border border-border bg-card px-8 py-6 text-center shadow-soft">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm font-semibold text-foreground">{message}</p>
      </div>
    </div>
  );
}
