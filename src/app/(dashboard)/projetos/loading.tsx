import { Skeleton } from "@/components/ui/skeleton";

export default function ProjetosLoading() {
  return (
    <div>
      <div className="flex justify-between mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="flex gap-3 mb-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}
