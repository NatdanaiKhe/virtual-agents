"use client";

import { CircuitBackground } from "../thegridcn/circuit-background";
import { GridScanOverlay } from "../thegridcn/grid-scan-overlay";
import type { ReactNode } from "react";

export function DashboardLayout({ header, filterBar, children }: { header: ReactNode; filterBar: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      <CircuitBackground opacity={0.06} animated>
        <GridScanOverlay gridSize={120} scanSpeed={10} />
        <div className="relative z-10 ">
          {/* <div className="px-4 sm:px-6 lg:px-8"> */}
          {header}
          {filterBar}
          {/* </div> */}
          <main className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </CircuitBackground>
    </div>
  );
}
