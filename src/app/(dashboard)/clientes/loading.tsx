import { Skeleton } from "@/components/ui/skeleton";

export default function ClientesLoading() {
  return (
    <div>
      <div className="flex justify-between mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-10 w-80 mb-4" />
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}
