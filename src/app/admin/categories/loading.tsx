import { Skeleton, TableSkeleton } from '../_components/SkeletonLoader';

export default function CategoriesLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
      <TableSkeleton />
    </div>
  );
}
