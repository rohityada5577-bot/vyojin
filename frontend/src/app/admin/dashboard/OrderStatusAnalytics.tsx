"use client";

import {
  Clock3,
  CheckCircle2,
  PackageCheck,
  Truck,
  CircleCheckBig,
  XCircle,
} from "lucide-react";

interface OrderStatusData {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface Props {
  data: OrderStatusData;
}

const statuses = [
  {
    key: "pending",
    label: "Pending",
    icon: Clock3,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
  },
  {
    key: "processing",
    label: "Processing",
    icon: PackageCheck,
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CircleCheckBig,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: XCircle,
  },
];

export default function OrderStatusAnalytics({
  data,
}: Props) {
  const total = Object.values(data).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Order Status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current order pipeline
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">

        {statuses.map((status) => {
          const Icon = status.icon;
          const count =
            data[
              status.key as keyof OrderStatusData
            ] || 0;

          const percentage =
            total > 0
              ? Math.round((count / total) * 100)
              : 0;

          return (
            <div
              key={status.key}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >

              <div className="mb-3 flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Icon size={18} />
                </div>

                <span className="text-xs text-gray-400">
                  {percentage}%
                </span>

              </div>

              <p className="text-sm text-gray-500">
                {status.label}
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {count}
              </p>

            </div>
          );
        })}

      </div>

    </section>
  );
}