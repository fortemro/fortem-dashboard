
import React from "react";
import { ProductieProduseTable } from "@/components/ProductieProduseTable";

export default function Productie() {
  return (
    <div className="max-w-4xl mx-auto pt-24 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M8 22v-7m4 7V12m4 10v-4m-9.59-1.59 6.59-6.58a2 2 0 0 1 2.83 0l1.88 1.88a1 1 0 0 0 1.42 0l.18-.18A2 2 0 0 1 22 14.59V22zm0 0H3a1 1 0 0 1-1-1V9.41a2 2 0 0 1 .59-1.41L9 2.59A2 2 0 0 1 10.41 2L15 6.59a2 2 0 0 1 0 2.83l-3.59 3.59"/></svg>
        Producție
      </h1>
      <div className="bg-white rounded-lg shadow p-8 min-h-[300px]">
        <p className="text-lg text-gray-700 mb-6">
          Bine ai venit în portalul Producție!
        </p>
        <ProductieProduseTable />
      </div>
    </div>
  );
}
