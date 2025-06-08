import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

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

export function OptionChainTable({ optionData }: { optionData: OptionData[] }) {
  const dollarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Table className="">
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Strike Price</TableHead>
          <TableHead>Market Premium</TableHead>
          <TableHead>BSM Premium</TableHead>
          <TableHead>Implied Volatility</TableHead>
          <TableHead>Moneyness (lnS/K)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {optionData.map((option, index) => (
          <TableRow key={index}>
            <TableCell>{option.symbol}</TableCell>
            <TableCell>{dollarFormatter.format(option.strikePrice)}</TableCell>
            <TableCell>{dollarFormatter.format(option.markPrice)}</TableCell>
            <TableCell>{dollarFormatter.format(option.bsmPrice)}</TableCell>
            <TableCell>{option.markIV}</TableCell>
            <TableCell>{option.logMoneyness}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
