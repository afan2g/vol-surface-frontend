import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AxisSelector({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue defaultValue="logMoneyness" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="logMoneyness">Log Moneyness ln(F/K)</SelectItem>
        <SelectItem value="strikePrice">Strike Price</SelectItem>
        <SelectItem value="moneyness">Moneyness (F/K)</SelectItem>
      </SelectContent>
    </Select>
  );
}
