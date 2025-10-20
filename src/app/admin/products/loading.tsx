import { Skeleton, TableSkeleton } from '../../_components/SkeletonLoader';

export default function ProductsLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <TableSkeleton />
    </div>
  );
}
