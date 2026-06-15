"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DataSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * 数据驱动的Select组件
 * 
 * @example
 * ```tsx
 * const options = [
 *   { value: "option1", label: "选项1" },
 *   { value: "option2", label: "选项2" },
 * ];
 * 
 * <DataSelect
 *   value={value}
 *   onValueChange={setValue}
 *   options={options}
 *   placeholder="请选择"
 * />
 * ```
 */
export function DataSelect({
  value,
  onValueChange,
  options,
  placeholder = "请选择",
  className,
  disabled = false,
}: DataSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
