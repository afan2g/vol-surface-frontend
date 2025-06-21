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
import { OptionInfoCard } from "./components/option-info-card";
const HOST = import.meta.env.VITE_API_SERVER_URL;

type SviPoint = {
  impliedVolatility: number;
  logMoneyness: number;
  moneyness: number;
  strikePrice: number;
  callPremium: number;
  putPremium: number;
};

type SingleOptionData = {
  bsmPrice: number;
  daysToExpiry: number;
  logMoneyness: number;
  impliedVolatility: number;
  moneyness: number;
  markPrice: number;
  riskFreeRate: number;
  spotPrice: number;
  strikePrice: number;
  symbol: string;
  timeToExpiry: number;
  forwardPrice: number;
};
type OptionResponse = {
  lastOptionUpdate: number;
  lastExchangeUpdate: number;
  C?: SingleOptionData[];
  P?: SingleOptionData[];
} | null;

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

export default function Layout() {
  const [availableAssets, setAvailableAssets] = useState<string[]>([]);
  const [assetSpotPrices, setAssetSpotPrices] = useState<
    Record<string, string>
  >({});
  const [expiryObject, setExpiryObject] = useState<
    Record<string, [number, string][]>
  >({});
  const [optionData, setOptionData] = useState<OptionResponse>(null);
  const [sviType, setSviType] = useState<"natural" | "raw">("natural");
  const [sviParams, setSviParams] = useState<number[] | null>(null);
  const [sviPoints, setSviPoints] = useState<SviPoint[] | null>(null);
  const [option, setOption] = useState<SelectedOption | null>(null);

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
      // console.log("Available assets:", assetsData);
      // console.log("Available expiries:", expiriesData);
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
              side: "A",
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
              side: "A",
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
        const jsonResp = await sviResponse.json();

        setOptionData(data);
        const parameterization_type = jsonResp.parameterization_type;
        const params = jsonResp.params;
        const points = jsonResp.points;
        setSviType(parameterization_type);
        setSviParams(params);
        setSviPoints(points);
        // console.log("SVI Type:", parameterization_type);
        // console.log("SVI Params:", params);
        // console.log("SVI Points:", points);
        // console.log(sviParams);
        console.log(availableAssets);
        // console.log("Options chain data:", data);
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
    setOption(selectedOption);
    fetchOptionsData(selectedOption);
  };

  const handleRefresh = async () => {
    // console.log("Refreshing option data for:", option);
    if (option) {
      await Promise.all([fetchOptionsData(option), fetchAssets()]);
    } else {
      console.warn("No option selected to refresh data for.");
    }
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
          <ResizablePanel minSize={25}>
            <div className="flex flex-col h-screen">
              {optionData && (
                <div className="flex-shrink-0 px-2 pt-2">
                  <OptionInfoCard
                    optionsData={optionData}
                    selectedOption={option || undefined}
                    spotPrices={assetSpotPrices}
                    onRefresh={handleRefresh}
                    sviParams={sviParams || undefined}
                  />
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-2">
                  {optionData?.C && (
                    <OptionChainTable
                      optionData={optionData.C}
                      caption="Call"
                    />
                  )}
                  {optionData?.P && (
                    <OptionChainTable optionData={optionData.P} caption="Put" />
                  )}
                </ScrollArea>
              </div>
            </div>
          </ResizablePanel>
          {optionData && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={70}>
                <VolChart
                  callData={optionData?.C}
                  putData={optionData?.P}
                  sviPoints={sviPoints || []}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </SidebarProvider>
    </ThemeProvider>
  );
}
