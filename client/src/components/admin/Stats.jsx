import { ShoppingBag } from "lucide-react";
import React from "react";

const Stats = ({ products = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white relativep-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center gap-4">
          <div className="p-6 bg-pink-50 text-pink-600 ">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-500">
              Total Products
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {products.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
