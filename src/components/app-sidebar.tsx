import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { DatePicker } from "./date-picker";
import { Combobox } from "./combo-box";
import { Toggle } from "./ui/toggle";
import { Button } from "./ui/button";
import { useState } from "react";
import { Value } from "@radix-ui/react-select";
import { set } from "date-fns";

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
  const [isPutsSelected, setIsPutsSelected] = useState<boolean>(true);
  const [isCallsSelected, setIsCallsSelected] = useState<boolean>(true);

  const { toggleSidebar } = useSidebar();
  const handleAssetSelected = (value: string) => {
    console.log("Selected asset:", value);
    setAsset(value);
    setExpiryDate(undefined);
    const dates = availableExpiries[value] ?? [];
    console.log("Available expiries for asset:", dates);
    setEnabledDates(
      dates.map((date) => {
        console.log("Date:", date);
        const newDate = new Date(date[0]); // Convert Unix timestamp to Date
        console.log("Converted date:", newDate);
        return newDate;
      })
    );
  };

  const handleDateSelected = (date: Date) => {
    console.log("Selected date:", date);
    setExpiryDate(date);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails({
        asset,
        expiryDate,
        isPutsSelected,
        isCallsSelected,
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
                    enabledDates.length === 1 ? "Expiry" : "Expiries"
                  }`
                : "Expiry date"
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem className="flex items-center justify-between gap-2 px-2">
          <Toggle
            className="w-full"
            variant="outline"
            onPressedChange={() => setIsPutsSelected(!isPutsSelected)}
            defaultPressed={true}
          >
            Puts
          </Toggle>
          <Toggle
            className="w-full"
            variant="outline"
            onPressedChange={() => setIsCallsSelected(!isCallsSelected)}
            defaultPressed={true}
          >
            Calls
          </Toggle>
        </SidebarMenuItem>
        <SidebarMenuItem className="px-2 w-full">
          <Button
            className="w-full"
            disabled={
              !asset || !expiryDate || (!isPutsSelected && !isCallsSelected)
            }
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </Sidebar>
  );
}
