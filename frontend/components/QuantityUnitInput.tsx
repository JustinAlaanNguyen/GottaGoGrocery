// components/QuantityUnitInput.tsx
import {
  Popover,
  PopoverTrigger,
  Input,
  PopoverContent,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  value: { quantity: string; unit: string };
  onChange: (val: { quantity: string; unit: string }) => void;
}

const commonUnits = [
  "cup",
  "cups",
  "tbsp",
  "tsp",
  "oz",
  "lb",
  "g",
  "kg",
  "ml",
  "l",
  "pinch",
  "dash",
  "slice",
  "clove",
  "can",
  "package",
];

const QuantityUnitInput: React.FC<Props> = ({ value, onChange }) => {
  const [query, setQuery] = useState(
    value.quantity && value.unit ? `${value.quantity} ${value.unit}` : ""
  );
  const [filtered, setFiltered] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: any) => {
    const val = e.target.value;
    setQuery(val);

    // Split into quantity + unit by first space
    const [q, ...uParts] = val.split(" ");
    const unitCandidate = uParts.join(" ");

    onChange({ quantity: q || "", unit: unitCandidate || "" });

    if (!unitCandidate) {
      setIsOpen(false);
      return;
    }

    const matches = commonUnits.filter((u) =>
      u.toLowerCase().startsWith(unitCandidate.toLowerCase())
    );
    setFiltered(matches);
    setIsOpen(matches.length > 0);
  };

  const handleSelect = (unit: string) => {
    const [q] = query.split(" ");
    const newVal = `${q} ${unit}`;
    setQuery(newVal);
    onChange({ quantity: q || "", unit });
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen}>
      <PopoverTrigger>
        <Input
          placeholder="e.g. 2 cups"
          value={query}
          onChange={handleChange}
          bg="#faedcd"
        />
      </PopoverTrigger>
      <PopoverContent maxH="200px" overflowY="auto" zIndex={999}>
        <List>
          {filtered.map((unit) => (
            <ListItem
              key={unit}
              px={3}
              py={2}
              _hover={{ bg: "#e9edc9", cursor: "pointer" }}
              onClick={() => handleSelect(unit)}
            >
              {unit}
            </ListItem>
          ))}
        </List>
      </PopoverContent>
    </Popover>
  );
};

export default QuantityUnitInput;
