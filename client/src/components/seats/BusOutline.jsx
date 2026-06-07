export default function BusOutline({ children }) {
  return (
    <div className="relative mx-auto max-w-md rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6">
      <div className="mb-4 flex items-center justify-between px-4">
        <div className="h-3 w-16 rounded-full bg-muted-foreground/20" />
        <span className="text-xs font-medium text-muted-foreground">FRONT</span>
        <div className="h-3 w-16 rounded-full bg-muted-foreground/20" />
      </div>
      {children}
      <div className="mt-4 text-center text-xs text-muted-foreground">Driver</div>
    </div>
  );
}
