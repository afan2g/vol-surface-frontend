import { Card, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "./ui/table";

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

type OptionsData = SingleOptionData[];
export function OptionChainTable({
  optionData,
  caption,
}: {
  optionData: OptionsData;
  caption: string;
}) {
  const dollarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Card className="my-2 px-4">
      <CardHeader className="pl-2">
        <CardTitle>{caption} Options Chain</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Strike Price</TableHead>
            <TableHead className="text-right">Premium</TableHead>
            <TableHead className="text-right">IV (%)</TableHead>
            <TableHead className="text-right">(lnK/F)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {optionData.map((option, index) => (
            <TableRow key={index}>
              <TableCell>{option.symbol}</TableCell>
              <TableCell className="text-right">
                {dollarFormatter.format(option.strikePrice)}
              </TableCell>
              <TableCell className="text-right">
                {dollarFormatter.format(option.markPrice)}
              </TableCell>
              <TableCell className="text-right">
                {option.markIV.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {option.logMoneyness.toFixed(3)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
