"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  IconButton,
  Flex,
  Text,
  useToast,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  List,
  ListItem,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import axios from "axios";
import UnitAutocompleteInput from "../../components/UnitAutocompleteInput";
import { containsProfanity } from "../../utils/profanityFilter";
import QuantityUnitInput from "../../components/QuantityUnitInput";

const floatingEmojiAnimation = {
  y: [0, 15, 0, 15, 0],
  rotate: [0, 15, 0, 15, 0],
  opacity: [0.4, 1, 0.4],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const cookingEmojis = ["🥕", "🍳", "🧄", "🥦", "🍅", "🧂"];

const MotionBox = motion(Box);

// --- Ingredient Autocomplete ---
interface AutoProps {
  value: string;
  onChange: (val: string) => void;
}

const IngredientAutocompleteInput: React.FC<AutoProps> = ({
  value,
  onChange,
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = async (e: any) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (!val) {
      setIsOpen(false);
      return;
    }

    try {
      const res = await axios.get(
        `https://api.spoonacular.com/food/ingredients/autocomplete`,
        {
          params: {
            query: val,
            number: 5,
            apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
          },
        }
      );

      const names = res.data.map((i: any) => i.name);
      setSuggestions(names);
      setIsOpen(names.length > 0);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  const handleSelect = (name: string) => {
    setQuery(name);
    onChange(name);
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen}>
      <PopoverTrigger>
        <Input
          placeholder="Ingredient"
          value={query}
          onChange={handleChange}
          bg="white"
        />
      </PopoverTrigger>
      <PopoverContent maxH="200px" overflowY="auto" zIndex={999}>
        <List>
          {suggestions.map((name) => (
            <ListItem
              key={name}
              px={3}
              py={2}
              _hover={{ bg: "#e9edc9", cursor: "pointer" }}
              onClick={() => handleSelect(name)}
            >
              {name}
            </ListItem>
          ))}
        </List>
      </PopoverContent>
    </Popover>
  );
};

// --- Main Component ---
export default function CreateCustomRecipePage() {
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [serving, setServing] = useState("");
  const [ingredients, setIngredients] = useState([
    { ingredient: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState([""]);
  const [notes, setNotes] = useState("");
  const [floatingIcons, setFloatingIcons] = useState<React.ReactElement[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Auth check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/account/signin");
      return;
    }
    setLoading(false);
  }, [router]);

  // Floating icons
  useEffect(() => {
    const items = [...Array(45)].map((_, i) => {
      const top = `${Math.random() * 90}%`;
      const left = `${Math.random() * 90}%`;
      const icon =
        cookingEmojis[Math.floor(Math.random() * cookingEmojis.length)];
      const rotation = Math.random() * 360;

      return (
        <MotionBox
          key={i}
          position="absolute"
          top={top}
          left={left}
          fontSize="26px"
          zIndex={0}
          style={{ transform: `rotate(${rotation}deg)` }}
          animate={floatingEmojiAnimation}
        >
          {icon}
        </MotionBox>
      );
    });
    setFloatingIcons(items);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !recipeDescription.trim()) {
      return toast({
        status: "warning",
        title: "Title & description required",
      });
    }

    // 🚨 Profanity check for all fields
    const fieldsToCheck = [
      title,
      recipeDescription,
      serving,
      notes,
      ...steps,
      ...ingredients.map((i) => i.ingredient),
      ...ingredients.map((i) => i.quantity),
      ...ingredients.map((i) => i.unit),
    ];

    if (fieldsToCheck.some((field) => containsProfanity(field))) {
      return toast({
        status: "error",
        title: "Inappropriate content detected",
        description: "Please remove profanity before saving.",
      });
    }

    const servingsNum = Number(serving);
    if (!Number.isInteger(servingsNum) || servingsNum <= 0) {
      return toast({
        status: "warning",
        title: "Servings must be a positive whole number",
      });
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      router.push("/account/signin");
      return;
    }

    await axios.post("http://localhost:5000/api/custom-recipes", {
      userId: user.id,
      title,
      recipeDescription,
      serving,
      ingredients,
      steps,
      notes,
    });

    toast({ status: "success", title: "Recipe created!" });
    router.push("/recipes/saved-recipes");
  };

  return (
    <Box bg="#ccd5ae" minH="100vh">
      <Navbar />

      {/* Background icons */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {floatingIcons}
      </Box>

      <Flex
        maxW="6xl"
        mx="auto"
        py={14}
        px={6}
        gap={10}
        position="relative"
        zIndex={1}
        direction={{ base: "column", md: "row" }}
      >
        {/* Left Panel */}
        <MotionBox
          flex="1"
          bg="white"
          rounded="2xl"
          shadow="lg"
          p={10}
          border="1px solid #e9edc9"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Heading mb={6} color="#344e41">
            Create a Custom Recipe 💡
          </Heading>

          <VStack spacing={6} align="stretch">
            <Input
              placeholder="Recipe Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              bg="#faedcd"
            />
            <Textarea
              placeholder="Short Description"
              value={recipeDescription}
              onChange={(e) => setRecipeDescription(e.target.value)}
              bg="#faedcd"
            />
            <Input
              placeholder="Servings"
              type="number"
              value={serving}
              onChange={(e) => setServing(e.target.value)}
              bg="#faedcd"
            />

            <Divider borderColor="#e9edc9" />

            <Heading fontSize="lg" color="#344e41">
              Ingredients
            </Heading>
            <AnimatePresence>
              {ingredients.map((ing, i) => (
                <MotionBox
                  key={i}
                  as={SimpleGrid}
                  columns={3}
                  spacing={3}
                  alignItems="center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {/* Quantity + Unit */}
                  <QuantityUnitInput
                    value={{ quantity: ing.quantity, unit: ing.unit }}
                    onChange={(val) => {
                      const updated = [...ingredients];
                      updated[i].quantity = val.quantity;
                      updated[i].unit = val.unit;
                      setIngredients(updated);
                    }}
                  />

                  {/* Ingredient name (with Spoonacular autocomplete) */}
                  <IngredientAutocompleteInput
                    value={ing.ingredient}
                    onChange={(val) => {
                      const updated = [...ingredients];
                      updated[i].ingredient = val;
                      setIngredients(updated);
                    }}
                  />

                  {/* Delete button */}
                  <IconButton
                    aria-label="Delete"
                    icon={<CloseIcon />}
                    size="sm"
                    bg="#a32c2c"
                    color="white"
                    _hover={{ bg: "#611b1b" }}
                    onClick={() => {
                      setIngredients(ingredients.filter((_, idx) => idx !== i));
                    }}
                  />
                </MotionBox>
              ))}
            </AnimatePresence>

            <Button
              size="sm"
              onClick={() =>
                setIngredients([
                  ...ingredients,
                  { ingredient: "", quantity: "", unit: "" },
                ])
              }
              bg="#d4a373"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
            >
              + Add Ingredient
            </Button>

            <Divider borderColor="#e9edc9" />

            <Heading fontSize="lg" color="#344e41">
              Steps
            </Heading>
            <AnimatePresence>
              {steps.map((st, i) => (
                <MotionBox
                  key={i}
                  display="flex"
                  gap={2}
                  alignItems="center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Textarea
                    placeholder={`Step ${i + 1}`}
                    value={st}
                    bg="#faedcd"
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[i] = e.target.value;
                      setSteps(updated);
                    }}
                  />
                  <IconButton
                    aria-label="Delete"
                    icon={<CloseIcon />}
                    size="sm"
                    bg="#a32c2c"
                    color="white"
                    _hover={{ bg: "#611b1b" }}
                    onClick={() =>
                      setSteps(steps.filter((_, idx) => idx !== i))
                    }
                  />
                </MotionBox>
              ))}
            </AnimatePresence>
            <Button
              size="sm"
              onClick={() => setSteps([...steps, ""])}
              bg="#d4a373"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
            >
              + Add Step
            </Button>

            <Textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              bg="#faedcd"
            />

            <Button
              bg="#344e41"
              color="white"
              size="lg"
              _hover={{ bg: "#ccd5ae", color: "black" }}
              onClick={handleSubmit}
            >
              Save Recipe
            </Button>

            <Button
              bg="#d4a373"
              color="white"
              size="lg"
              _hover={{ bg: "#ccd5ae", color: "black" }}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </VStack>
        </MotionBox>

        {/* Right Panel Preview */}
        <MotionBox
          bg="white"
          rounded="2xl"
          shadow="lg"
          p={8}
          flex="1"
          border="1px solid #e9edc9"
          display={{ base: "none", md: "block" }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Heading mb={4} color="#344e41">
            Live Preview 🧾
          </Heading>

          <Text fontWeight="bold" fontSize="2xl" color="#344e41">
            {title || "Recipe Title"}
          </Text>
          <Text mb={2}>{recipeDescription || "Description goes here..."}</Text>
          <Text mb={4}>
            <b>Servings: </b> {serving || "-"}
          </Text>

          <Heading size="md" mt={3} color="#344e41">
            Ingredients
          </Heading>
          <ul>
            {ingredients.map(
              (ing, i) =>
                ing.ingredient && (
                  <li key={i}>
                    {ing.quantity} {ing.unit} {ing.ingredient}
                  </li>
                )
            )}
          </ul>

          <Heading size="md" mt={4} color="#344e41">
            Steps
          </Heading>
          <ol>
            {steps.map(
              (st, i) =>
                st && (
                  <li key={i}>
                    <Text>{st}</Text>
                  </li>
                )
            )}
          </ol>

          <Heading size="md" mt={4} color="#344e41">
            Notes
          </Heading>
          <Text>{notes || "-"}</Text>
        </MotionBox>
      </Flex>
    </Box>
  );
}
