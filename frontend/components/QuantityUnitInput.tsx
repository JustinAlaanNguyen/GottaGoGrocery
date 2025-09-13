// components/QuantityUnitInput.tsx
"use client";

import { Input, Flex } from "@chakra-ui/react";
import { formatQuantity } from "../utils/formatFraction";

interface Props {
  value: { quantity: string; unit: string };
  onChange: (val: { quantity: string; unit: string }) => void;
}

export default function QuantityUnitInput({ value, onChange }: Props) {
  return (
    <Flex gap={2}>
      <Input
        placeholder="Qty"
        type="text"
        value={value.quantity}
        onChange={(e) => onChange({ ...value, quantity: e.target.value })}
        onBlur={() =>
          onChange({
            ...value,
            quantity: formatQuantity(value.quantity),
          })
        }
        bg="white"
      />
      <Input
        placeholder="Unit"
        type="text"
        value={value.unit}
        onChange={(e) => onChange({ ...value, unit: e.target.value })}
        bg="white"
      />
    </Flex>
  );
}
