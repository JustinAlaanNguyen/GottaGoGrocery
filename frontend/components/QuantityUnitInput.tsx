// components/QuantityUnitInput.tsx
"use client";

import { Input, Flex } from "@chakra-ui/react";
import { formatQuantity } from "../utils/formatFraction";
import UnitAutocompleteInput from "./UnitAutocompleteInput";

interface Props {
  value: { quantity: string; unit: string };
  onChange: (val: { quantity: string; unit: string }) => void;
}

export default function QuantityUnitInput({ value, onChange }: Props) {
  return (
    <Flex gap={2}>
      {/* Quantity input */}
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

      {/* Unit input now with autocomplete */}
      <UnitAutocompleteInput
        value={value.unit}
        onChange={(unitVal) => onChange({ ...value, unit: unitVal })}
      />
    </Flex>
  );
}
