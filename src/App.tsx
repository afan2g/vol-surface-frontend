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
  asset: string;
  expiry: string;
  spotPrice: number;
  timeToExpiry: number;
  forwardPrice: number;
  riskFreeRate: number;
  C?: SingleOptionData[];
  P?: SingleOptionData[];
} | null;

type SelectedOption = {
  asset: string;
  expiryDate: Date;
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
    Record<string, [string, number][]>
  >({});
  const [optionData, setOptionData] = useState<OptionResponse>(null);
  const [sviType, setSviType] = useState<"natural" | "raw">("natural");
  const [sviParams, setSviParams] = useState<number[] | null>(null);
  const [sviPoints, setSviPoints] = useState<SviPoint[] | null>(null);
  const [option, setOption] = useState<SelectedOption | null>(null);
  const [customOption, setCustomOption] = useState<SviPoint | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchAssets(), fetchExpiries()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  const fetchAssets = async () => {
    try {
      const assetsResponse = await fetch(`${HOST}/assets`);
      if (!assetsResponse.ok) {
        throw new Error("Network response was not ok");
      }
      const assetsData = await assetsResponse.json();
      setAvailableAssets(assetsData.assets);
      setAssetSpotPrices(assetsData.spot_prices);
      // console.log("Available assets:", assetsData.assets);
      // console.log("Asset spot prices:", assetsData.spot_prices);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const fetchExpiries = async () => {
    try {
      const expiriesResponse = await fetch(`${HOST}/expiries`);
      if (!expiriesResponse.ok) {
        throw new Error("Network response was not ok");
      }
      const expiriesData = await expiriesResponse.json();
      setExpiryObject(expiriesData);
      // console.log("Available expiries:", expiriesData);
    } catch (error) {
      console.error("Error fetching expiries:", error);
    }
  };
  const fetchOptionsData = async (selectedOption: SelectedOption) => {
    if (selectedOption) {
      try {
        // console.log("Fetching options data for:", selectedOption);
        const [optionChainData, sviData] = await Promise.all([
          fetchOptionsChain(selectedOption.asset, selectedOption.expiryDate!),
          fetchSviCurve(
            selectedOption.asset,
            selectedOption.expiryDate!,
            sviType
          ),
        ]);

        setOptionData(optionChainData);
        const parameterization_type = sviData.parameterization_type;
        const params = sviData.params;
        const points = sviData.points;
        setSviType(parameterization_type);
        setSviParams(params);
        setSviPoints(points);
        // console.log(availableAssets);
      } catch (error) {
        console.error("Error fetching options data:", error);
      } finally {
      }
    } else {
      console.warn("No selected option to fetch data for.");
    }
  };
  const fetchOptionsChain = async (asset: string, expiry: Date) => {
    const response = await fetch(`${HOST}/option_chain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset: asset,
        expiry: toYYMMDD(expiry),
        side: "A",
      }),
    });
    if (!response.ok) {
      throw new Error("Options chain fetch failed");
    }
    const data = await response.json();
    return data;
  };

  const fetchSviCurve = async (
    asset: string,
    expiry: Date,
    sviType: "natural" | "raw"
  ) => {
    const response = await fetch(`${HOST}/svi_curve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset,
        expiry: toYYMMDD(expiry),
        side: "A",
        parameterization_type: sviType,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch SVI curve data");
    }
    const data = await response.json();
    return data;
  };
  const handleViewDetails = (selectedOption: SelectedOption) => {
    // console.log("Selected option for details:", selectedOption);
    const yymmdd = toYYMMDD(selectedOption.expiryDate!);
    const expiryArr = expiryObject[selectedOption.asset] || [];
    const found = expiryArr.find((val) => val[0] === yymmdd);
    // console.log("Found expiry:", found);
    const expiryTimestamp = found ? found[1] : undefined;
    const date = expiryTimestamp ? new Date(expiryTimestamp) : undefined;
    if (date) {
      setOption({ ...selectedOption, expiryDate: date });
      fetchOptionsData({ ...selectedOption, expiryDate: date });
    } else {
      console.warn("Expiry date is undefined, cannot set option.");
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) {
      console.warn("Refresh already in progress, ignoring request.");
      return;
    }
    if (!option) {
      console.warn("No option selected to refresh data for.");
      return;
    }
    setIsRefreshing(true);
    try {
      await Promise.all([fetchOptionsData(option), fetchAssets()]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSviChange = async (value: "natural" | "raw") => {
    // console.log("Current SVI type:", sviType);
    // console.log("Handling SVI change to:", value);
    if (value === sviType) {
      console.log("SVI type is the same, no need to fetch again.");
      return;
    }
    // console.log("Changing SVI type to:", value);
    if (option) {
      try {
        const sviData = await fetchSviCurve(
          option.asset,
          option.expiryDate!,
          value
        );
        console.log("Fetched SVI data. params:", sviData.params);
        setSviType(sviData.parameterization_type);
        setSviParams(sviData.params);
        setSviPoints(sviData.points);
      } catch (error) {
        console.error("Error fetching SVI curve:", error);
      }
    }
  };

  const handleCustomOptionChange = (option: SviPoint | null) => {
    setCustomOption(option);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppSidebar
          onViewDetails={handleViewDetails}
          availableAssets={availableAssets}
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
                    sviType={sviType}
                    onSviChange={handleSviChange}
                    onOptionChange={handleCustomOptionChange}
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
                  customPoint={customOption || undefined}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </SidebarProvider>
    </ThemeProvider>
  );
}
