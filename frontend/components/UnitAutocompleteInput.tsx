import {
  Popover,
  PopoverTrigger,
  Input,
  PopoverContent,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useState } from "react";

interface UnitProps {
  value: string;
  onChange: (val: string) => void;
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

const UnitAutocompleteInput: React.FC<UnitProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState(value);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: any) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (!val) {
      setIsOpen(false);
      return;
    }

    const matches = commonUnits.filter((u) =>
      u.toLowerCase().startsWith(val.toLowerCase())
    );
    setFiltered(matches);
    setIsOpen(matches.length > 0);
  };

  const handleSelect = (unit: string) => {
    setQuery(unit);
    onChange(unit);
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen}>
      <PopoverTrigger>
        <Input
          placeholder="Qty (e.g. 2 cups)"
          value={query}
          onChange={handleChange}
        />
      </PopoverTrigger>
      <PopoverContent maxH="200px" overflowY="auto" zIndex={999}>
        <List>
          {filtered.map((unit) => (
            <ListItem
              key={unit}
              px={3}
              py={2}
              _hover={{ bg: "gray.100", cursor: "pointer" }}
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

export default UnitAutocompleteInput;
