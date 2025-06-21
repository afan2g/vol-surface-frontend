import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { DatePicker } from "./date-picker";
import { Combobox } from "./combo-box";
import { Button } from "./ui/button";
import { useState } from "react";

type SelectedOption = {
  asset?: string;
  expiryDate?: Date;
  isPutsSelected?: boolean;
  isCallsSelected?: boolean;
};
type SidebarProps = {
  onViewDetails?: (option: SelectedOption) => void;
  availableAssets?: string[];
  spotPrices?: Record<string, string>;
  availableExpiries: Record<string, [number, string][]>;
};
export function AppSidebar({
  onViewDetails,
  spotPrices,
  availableExpiries,
}: SidebarProps) {
  const [asset, setAsset] = useState<string | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [enabledDates, setEnabledDates] = useState<Date[]>([]);

  const { toggleSidebar } = useSidebar();
  const handleAssetSelected = (value: string) => {
    setAsset(value);
    setExpiryDate(undefined);
    const dates = availableExpiries[value] ?? [];
    setEnabledDates(
      dates.map((date) => {
        console.log("Converting date:", date[0]);
        const newDate = new Date(date[0]); // Convert Unix timestamp to Date
        console.log("Converted date:", newDate);
        return newDate;
      })
    );
  };

  const handleDateSelected = (date: Date) => {
    setExpiryDate(date);
    console.log("Selected expiry date:", date);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails({
        asset,
        expiryDate,
      });
    }
    toggleSidebar();
  };

  return (
    <Sidebar>
      <SidebarMenu className="gap-2">
        <SidebarMenuItem>
          <Combobox
            onItemSelected={handleAssetSelected}
            spotPrices={spotPrices ?? {}}
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <DatePicker
            onDateSelected={handleDateSelected}
            disabled={!asset}
            enabledDates={enabledDates}
            date={expiryDate}
            placeholder={
              asset
                ? `${enabledDates.length} ${
                    enabledDates.length === 1 ? "Expiry" : "Expiries available"
                  }`
                : "Select an asset first"
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem className="flex items-center justify-between gap-2 px-2"></SidebarMenuItem>
        <SidebarMenuItem className="px-2 w-full">
          <Button
            className="w-full"
            disabled={!asset || !expiryDate}
            onClick={handleViewDetails}
          >
            {!asset
              ? "Select an asset"
              : !expiryDate
              ? "Select expiry date"
              : "View Details"}
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </Sidebar>
  );
}
