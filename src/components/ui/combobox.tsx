import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  allowCustom?: boolean
  className?: string
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  allowCustom = true,
  className
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setInputValue(selectedValue)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    if (allowCustom) {
      onValueChange(newValue)
    }
  }

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  const exactMatch = options.find(option => 
    option.value.toLowerCase() === inputValue.toLowerCase()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600", className)}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-400"
            onFocus={() => setOpen(true)}
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-slate-700 border-slate-600" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command className="bg-slate-700">
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={inputValue}
            onValueChange={handleInputChange}
            className="text-white"
          />
          <CommandList>
            <CommandEmpty className="text-slate-400 p-4">{emptyText}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="text-white hover:bg-slate-600"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {allowCustom && inputValue && !exactMatch && inputValue.trim() && (
                <CommandItem
                  value={inputValue}
                  onSelect={() => handleSelect(inputValue)}
                  className="text-white hover:bg-slate-600 border-t border-slate-600 mt-1"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Add "{inputValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}