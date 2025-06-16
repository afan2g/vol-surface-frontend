import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import Countdown from "react-countdown";
import type { CountdownTimeDelta } from "react-countdown";
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
};

type SelectedOption = {
  asset?: string;
  expiryDate?: Date;
  isPutsSelected?: boolean;
  isCallsSelected?: boolean;
};

type SVIParams = number[];

type OptionInfoCardProps = {
  optionsData: OptionResponse;
  selectedOption?: SelectedOption;
  sviParams?: SVIParams;
  sviType?: "natural" | "raw";
  spotPrices?: Record<string, string>;
  onRefresh?: () => void;
};
export function OptionInfoCard({
  optionsData,
  selectedOption,
  sviParams,
  sviType = "natural",
  spotPrices = {},
  onRefresh,
}: OptionInfoCardProps) {
  console.log("Rendering OptionInfoCard with optionsData:", optionsData);
  const dollarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const handleTick = (timedelta: CountdownTimeDelta) => {
    console.log("Countdown ticked");
    if (timedelta.minutes >= 1 && timedelta.seconds > 10) {
      console.log("1 minute");
      onRefresh?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          Option Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-sm text-gray-500 ">
          <div className="flex flex-row items-center justify-between">
            <span>Asset: {selectedOption?.asset}</span>
            <span>
              Spot Price:{" "}
              {dollarFormatter.format(
                Number(spotPrices[selectedOption?.asset ?? ""])
              )}
            </span>
            <span>
              Forward Price:{" "}
              {dollarFormatter.format(
                optionsData.C?.[0]?.forwardPrice ??
                  optionsData.P?.[0]?.forwardPrice ??
                  0
              )}
            </span>
          </div>
          <div className="flex flex-row items-center justify-between">
            <span>
              Expiry Date: {selectedOption?.expiryDate?.toLocaleString()}
            </span>
            <Countdown
              date={selectedOption?.expiryDate}
              renderer={({ days, hours, minutes, seconds }) => (
                <span>
                  Expires in: {days}d {hours}h {minutes}m {seconds}s
                </span>
              )}
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <Countdown
              date={new Date(optionsData.lastOptionUpdate)}
              overtime={true}
              renderer={({ days, hours, minutes, seconds }) => (
                <span>
                  Last options update: {days > 0 ? `${days}d ` : ""}{" "}
                  {hours > 0 ? `${hours}h ` : ""}{" "}
                  {minutes > 0 ? `${minutes}m ` : ""} {seconds}s ago
                </span>
              )}
              onTick={handleTick}
            />
            <Countdown
              date={new Date(optionsData.lastExchangeUpdate)}
              overtime={true}
              renderer={({ days, hours, minutes, seconds }) => (
                <span>
                  Last exchange update: {days > 0 ? `${days}d ` : ""}{" "}
                  {hours > 0 ? `${hours}h ` : ""}{" "}
                  {minutes > 0 ? `${minutes}m ` : ""} {seconds}s ago
                </span>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
