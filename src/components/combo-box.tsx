import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const assets = [
  {
    value: "BTC",
    label: "Bitcoin",
  },
  {
    value: "ETH",
    label: "Ethereum",
  },
  {
    value: "BNB",
    label: "BNB",
  },
  {
    value: "SOL",
    label: "Solana",
  },
  {
    value: "XRP",
    label: "Ripple",
  },
  {
    value: "DOGE",
    label: "Dogecoin",
  },
];

type ComboboxProps = {
  spotPrices: Record<string, string>;
  onItemSelected?: (value: string) => void;
};

export function Combobox(props: ComboboxProps) {
  const { spotPrices, onItemSelected } = props;
  const [open, setOpen] = React.useState(false);
  const [asset, setAsset] = React.useState("");
  const assetsWithPrices = assets.map((asset) => ({
    ...asset,
    price: spotPrices[asset.value] || "0",
  }));
  const handleSelect = (index: number) => {
    setAsset(assetsWithPrices[index].value);
    console.log("Selected asset:", assetsWithPrices[index]);
    setOpen(false);
    if (onItemSelected) {
      onItemSelected(assetsWithPrices[index].value);
    }
  };

  const dollarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between "
        >
          {asset
            ? `${
                assetsWithPrices.find((a) => a.value === asset)?.label
              } - ${dollarFormatter.format(
                Number(
                  assetsWithPrices.find((a) => a.value === asset)?.price ?? 0
                )
              )}`
            : "Select asset"}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] px-0 py-0">
        <Command>
          <CommandInput placeholder="Search asset..." />
          <CommandList>
            <CommandEmpty>No asset found.</CommandEmpty>
            <CommandGroup>
              {assetsWithPrices.map((thisAsset, index) => (
                <CommandItem
                  key={thisAsset.value}
                  value={thisAsset.value}
                  onSelect={() => handleSelect(index)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      asset === thisAsset.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {thisAsset.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
