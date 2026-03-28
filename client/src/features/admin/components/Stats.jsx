import { ShoppingBag } from "lucide-react";
import React from "react";

const Stats = ({ products = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass relativep-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-6 bg-violet-500/10 text-violet-400 ">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-500">
              Total Products
            </div>
            <div className="text-2xl font-bold text-white">
              {products.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
