import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allOption?: SearchableSelectOption | null;
  triggerClassName?: string;
  contentClassName?: string;
}

/** Item da lista: destaque verde quando selecionado. */
const itemClass = (isSelected: boolean) =>
  cn(
    "rounded-md px-2.5 py-2 text-sm font-medium text-foreground cursor-pointer",
    "data-[selected=true]:bg-accent data-[selected=true]:text-foreground",
    isSelected &&
      "bg-primary font-semibold text-primary-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
  );


export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum item encontrado.",
  allOption = { value: "all", label: "Todos" },
  triggerClassName,
  contentClassName,
}: SearchableSelectProps) {
  const selected =
    allOption && value === allOption.value ? allOption : options.find((o) => o.value === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-[200px] justify-between text-xs font-normal neu-inset border-0",
            !selected && "text-muted-foreground",
            triggerClassName
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[240px] p-0 neu-dialog border-0 overflow-hidden", contentClassName)}
        align="start"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder={searchPlaceholder}
            className="text-xs placeholder:text-muted-foreground/70"
          />
          <CommandList className="neu-scroll max-h-[300px] p-1.5">
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup className="p-0">
              {allOption && (
                <CommandItem
                  value={allOption.label}
                  onSelect={() => onValueChange(allOption.value)}
                  className={itemClass(value === allOption.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === allOption.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {allOption.label}
                </CommandItem>
              )}
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => onValueChange(opt.value)}
                  className={itemClass(value === opt.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>

    </Popover>
  );
}
