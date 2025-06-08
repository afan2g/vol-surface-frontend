import { Calendar } from "./components/ui/calendar";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { ThemeProvider } from "./components/theme-provider";
import { OptionChainTable } from "./components/option-chain-table";
const HOST = import.meta.env.VITE_API_SERVER_URL;

type Option = {
  asset: string;
  expiryDate: string;
  type: string; // "call" or "put"
};

type OptionData = {
  bsmPrice: bigint;
  daysToExpiry: number;
  logMoneyness: bigint;
  markIV: bigint;
  moneyness: bigint;
  markPrice: bigint;
  riskFreeRate: bigint;
  spotPrice: bigint;
  strikePrice: bigint;
  symbol: string;
  timeToExpiry: number;
};

type OptionResponse = {
  C?: OptionData[];
  P?: OptionData[];
};

type SelectedOption = {
  asset?: string;
  expiryDate?: Date;
  isPutsSelected?: boolean;
  isCallsSelected?: boolean;
};

function toYYMMDD(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const dd = String(date.getDate()).padStart(2, "0");
  return yy + mm + dd;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [availableAssets, setAvailableAssets] = useState<string[]>([]);
  const [assetSpotPrices, setAssetSpotPrices] = useState<
    Record<string, string>
  >({});
  const [expiryObject, setExpiryObject] = useState<
    Record<string, [number, string][]>
  >({});
  const [optionData, setOptionData] = useState<OptionResponse>({});

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const [assetsResponse, expiriesResponse] = await Promise.all([
        fetch(`${HOST}/assets`),
        fetch(`${HOST}/expiries`),
      ]);
      if (!assetsResponse.ok || !expiriesResponse.ok) {
        throw new Error("Network response was not ok");
      }
      const [assetsData, expiriesData] = await Promise.all([
        assetsResponse.json(),
        expiriesResponse.json(),
      ]);
      setAvailableAssets(assetsData.assets);
      setAssetSpotPrices(assetsData.spot_prices);
      setExpiryObject(expiriesData);
      console.log("Available assets:", assetsData);
      console.log("Available expiries:", expiriesData);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const fetchOptionsData = async (selectedOption: SelectedOption) => {
    if (selectedOption) {
      try {
        const response = await fetch(`${HOST}/option_chain`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            asset: selectedOption.asset,
            expiry: toYYMMDD(selectedOption.expiryDate!),
            side: selectedOption.isPutsSelected
              ? selectedOption.isCallsSelected
                ? "A"
                : "P"
              : "C",
          }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setOptionData(data);

        console.log("Options chain data:", data);
      } catch (error) {
        console.error("Error fetching options chain:", error);
      } finally {
      }
    } else {
      console.warn("No selected option to fetch data for.");
    }
  };

  const handleViewDetails = (selectedOption: SelectedOption) => {
    console.log("Selected option for details:", selectedOption);
    fetchOptionsData(selectedOption);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppSidebar
          onViewDetails={handleViewDetails}
          spotPrices={assetSpotPrices}
        />
        <main className="flex-1">
          <SidebarTrigger />
          {(optionData.C || optionData.P) && (
            <OptionChainTable optionData={optionData.C ?? optionData.P ?? []} />
          )}
        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
}
