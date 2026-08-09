import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

export function SortSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground sm:inline">
        Sort
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          size="sm"
          className="glass-chip h-8 w-44 border-0 text-xs"
        >
          <ArrowUpDown className="size-3.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
