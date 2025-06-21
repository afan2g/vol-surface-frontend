import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import Countdown from "react-countdown";
import type { CountdownTimeDelta } from "react-countdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { useState } from "react";
import {
  calculateBSMPrice,
  calculateLogMoneyness,
  calculateMoneyness,
  naturalSVIVol,
  rawSVIVol,
} from "@/utils/option-formulas";
import { Input } from "./ui/input";
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
};

type SelectedOption = {
  asset?: string;
  expiryDate?: Date;
  isPutsSelected?: boolean;
  isCallsSelected?: boolean;
};

type SVIPoint = {
  impliedVolatility: number;
  logMoneyness: number;
  moneyness: number;
  strikePrice: number;
  callPremium: number;
  putPremium: number;
};

type SVIParams = number[];

type OptionInfoCardProps = {
  optionsData: OptionResponse;
  selectedOption?: SelectedOption;
  sviParams?: SVIParams;
  sviType?: "natural" | "raw";
  spotPrices?: Record<string, string>;
  onRefresh?: () => void;
  onSviChange?: (value: "natural" | "raw") => void;
  onOptionChange?: (option: SVIPoint | null) => void;
};

export function OptionInfoCard({
  optionsData,
  selectedOption,
  sviParams,
  sviType = "natural",
  spotPrices = {},
  onRefresh,
  onSviChange = () => {},
  onOptionChange = () => {},
}: OptionInfoCardProps) {
  const [minStrikePrice, setMinStrikePrice] = useState<number | undefined>(
    undefined
  );
  const [maxStrikePrice, setMaxStrikePrice] = useState<number | undefined>(
    undefined
  );
  const [sliderValue, setSliderValue] = useState<number>(
    Number(spotPrices[selectedOption?.asset ?? ""] ?? 0)
  );
  const [sliderStep, setSliderStep] = useState<number | undefined>(undefined);
  const [calculatedOption, setCalculatedOption] = useState<SVIPoint | null>(
    null
  );

  useEffect(() => {
    setCalculatedOption(null);
    onOptionChange(null);
    if (optionsData.C && optionsData.C.length > 0) {
      // const strikePrices = optionsData.C.map((option) => option.strikePrice);
      const minPrice = optionsData.C[0].strikePrice;
      const maxPrice = optionsData.C[optionsData.C.length - 1].strikePrice;
      const step = (maxPrice - minPrice) / 100;
      setMinStrikePrice(minPrice - 20 * step);
      setMaxStrikePrice(maxPrice + 20 * step);
      setSliderValue((minPrice + maxPrice) / 2);
      setSliderStep(step);
    } else if (optionsData.P && optionsData.P.length > 0) {
      const minPrice = optionsData.P[0].strikePrice;
      const maxPrice = optionsData.P[optionsData.P.length - 1].strikePrice;
      const step = (maxPrice - minPrice) / 100;
      setMinStrikePrice(minPrice - 20 * step);
      setMaxStrikePrice(maxPrice + 20 * step);
      setSliderValue((minPrice + maxPrice) / 2);
      setSliderStep(step);
    }
  }, [optionsData.expiry, optionsData.asset]);
  const dollarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const handleTick = (timedelta: CountdownTimeDelta) => {
    if (timedelta.seconds >= 5) {
      onRefresh?.();
    }
  };
  const handleValueChange = (value: number[]) => {
    setSliderValue(value[0]);
    const strikePrice = value[0];
    const forwardPrice = optionsData.forwardPrice;
    const logMoneyness = calculateLogMoneyness(strikePrice, forwardPrice);
    const moneyness = calculateMoneyness(strikePrice, forwardPrice);
    const timeToExpiry = optionsData.timeToExpiry;
    const impliedVolatility =
      sviType === "natural"
        ? naturalSVIVol(
            strikePrice,
            forwardPrice,
            sviParams || [],
            timeToExpiry
          )
        : rawSVIVol(strikePrice, forwardPrice, sviParams || [], timeToExpiry);
    const callPrice = calculateBSMPrice({
      strikePrice,
      spotPrice: optionsData.spotPrice,
      timeToExpiry,
      riskFreeRate: optionsData.riskFreeRate,
      impliedVolatility,
      isCall: true,
    });
    const putPrice = calculateBSMPrice({
      strikePrice,
      spotPrice: optionsData.spotPrice,
      timeToExpiry,
      riskFreeRate: optionsData.riskFreeRate,
      impliedVolatility,
      isCall: false,
    });

    const newOptionData: SVIPoint = {
      impliedVolatility,
      logMoneyness,
      moneyness,
      strikePrice,
      callPremium: callPrice,
      putPremium: putPrice,
    };
    setCalculatedOption(newOptionData);
    onOptionChange(newOptionData);
  };

  useEffect(() => {
    if (calculatedOption) {
      const forwardPrice = optionsData.forwardPrice;
      const strikePrice = calculatedOption.strikePrice;
      const timeToExpiry = optionsData.timeToExpiry;
      const logMoneyness = calculateLogMoneyness(strikePrice, forwardPrice);
      const moneyness = calculateMoneyness(strikePrice, forwardPrice);
      const impliedVolatility =
        sviType === "natural"
          ? naturalSVIVol(
              strikePrice,
              forwardPrice,
              sviParams || [],
              timeToExpiry
            )
          : rawSVIVol(strikePrice, forwardPrice, sviParams || [], timeToExpiry);
      const callPrice = calculateBSMPrice({
        strikePrice,
        spotPrice: optionsData.spotPrice,
        timeToExpiry: optionsData.timeToExpiry,
        riskFreeRate: optionsData.riskFreeRate,
        impliedVolatility: impliedVolatility,
        isCall: true,
      });
      const putPrice = calculateBSMPrice({
        strikePrice,
        spotPrice: optionsData.spotPrice,
        timeToExpiry: optionsData.timeToExpiry,
        riskFreeRate: optionsData.riskFreeRate,
        impliedVolatility: impliedVolatility,
        isCall: false,
      });
      setCalculatedOption({
        impliedVolatility,
        logMoneyness,
        moneyness,
        strikePrice,
        callPremium: callPrice,
        putPremium: putPrice,
      });
    }
  }, [optionsData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^0-9.-]+/g, ""));
    setSliderValue(value);
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
          <div className="flex flex-row items-center justify-between">
            <Select value={sviType} onValueChange={onSviChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural SVI</SelectItem>
                <SelectItem value="raw">Raw SVI</SelectItem>
              </SelectContent>
            </Select>
            <span>
              {sviType === "natural" ? "∆" : "a"}: {sviParams?.[0].toFixed(4)}
            </span>
            <span>
              {sviType === "natural" ? "µ" : "b"}: {sviParams?.[1].toFixed(4)}
            </span>
            <span>
              {sviType === "natural" ? "ρ" : "ρ"}: {sviParams?.[2].toFixed(4)}
            </span>
            <span>
              {sviType === "natural" ? "ω" : "m"}: {sviParams?.[3].toFixed(4)}
            </span>
            <span>
              {sviType === "natural" ? "ζ" : "σ"}: {sviParams?.[4].toFixed(4)}
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between mt-4">
          <Slider
            min={minStrikePrice}
            max={maxStrikePrice}
            step={sliderStep}
            value={[sliderValue]}
            onValueChange={handleValueChange}
          />
          <Input
            className="mx-2 w-1/6"
            value={dollarFormatter.format(sliderValue)}
            onChangeCapture={handleInputChange}
          />
        </div>
        <div className="flex flex-col text-sm text-gray-500 mt-2">
          <span>
            Selected Strike Price: {dollarFormatter.format(sliderValue)}
          </span>
          <span>Moneyness (F/K): {calculatedOption?.moneyness.toFixed(4)}</span>
          <span>
            Log Moneyness: {calculatedOption?.logMoneyness.toFixed(4)}
          </span>
          <span>
            Implied Volatility: {calculatedOption?.impliedVolatility.toFixed(4)}
          </span>
          <span>
            BSM Call Premium:{" "}
            {dollarFormatter.format(calculatedOption?.callPremium ?? 0)}
          </span>
          <span>
            BSM Put Premium:{" "}
            {dollarFormatter.format(calculatedOption?.putPremium ?? 0)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
