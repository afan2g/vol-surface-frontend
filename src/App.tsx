import { Calendar } from "./components/ui/calendar";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { ThemeProvider } from "./components/theme-provider";
import { OptionChainTable } from "./components/option-chain-table";
import { VolChart } from "./components/vol-chart";
import { ScrollArea } from "./components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
const HOST = import.meta.env.VITE_API_SERVER_URL;

type SviPoint = {
  impliedVolatility: number;
  logMoneyness: number;
  moneyness: number;
  strikePrice: number;
};

type SingleOptionData = {
  bsmPrice: number;
  daysToExpiry: number;
  logMoneyness: number;
  markIV: number;
  moneyness: number;
  markPrice: number;
  riskFreeRate: number;
  spotPrice: number;
  strikePrice: number;
  symbol: string;
  timeToExpiry: number;
};

type OptionResponse = {
  C?: SingleOptionData[];
  P?: SingleOptionData[];
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
  const [sviType, setSviType] = useState<"natural" | "raw">("natural");
  const [sviParams, setSviParams] = useState<number[]>([]);
  const [sviPoints, setSviPoints] = useState<SviPoint[]>([]);

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
        const [optionChainResponse, sviResponse] = await Promise.all([
          fetch(`${HOST}/option_chain`, {
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
          }),
          fetch(`${HOST}/svi_curve`, {
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
              parameterization_type: sviType,
            }),
          }),
        ]);
        if (!optionChainResponse.ok) {
          throw new Error("Network response was not ok");
        }
        if (!sviResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await optionChainResponse.json();
        const { parameterization_type, params, points } =
          await sviResponse.json();
        setOptionData(data);
        setSviType(parameterization_type);
        setSviParams(params);
        setSviPoints(points);
        console.log("SVI Type:", parameterization_type);
        console.log("SVI Params:", params);
        console.log("SVI Points:", points);

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
          availableExpiries={expiryObject}
        />
        <ResizablePanelGroup direction="horizontal">
          <SidebarTrigger />
          <ResizablePanel maxSize={30} minSize={25}>
            <ScrollArea className=" h-[calc(100vh)] px-2 ">
              {optionData.C && (
                <OptionChainTable optionData={optionData.C} caption="Call" />
              )}
              {optionData.P && (
                <OptionChainTable optionData={optionData.P} caption="Put" />
              )}
            </ScrollArea>
          </ResizablePanel>
          {(optionData.C || optionData.P) && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={70} maxSize={80}>
                <VolChart
                  callData={optionData?.C}
                  putData={optionData?.P}
                  sviPoints={sviPoints}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </SidebarProvider>
    </ThemeProvider>
  );
}
