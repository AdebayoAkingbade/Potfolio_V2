export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="w-full max-w-sm px-6 text-center">
        <div className="mx-auto h-10 w-10 rounded-md border border-primary/40 bg-primary/10" />
        <p className="mt-5 text-sm uppercase tracking-[0.3em] text-muted-foreground">Loading</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </div>
  );
}
