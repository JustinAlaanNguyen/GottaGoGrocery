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
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../../components/Navbar";
import axios from "axios";

const floatingEmojiAnimation = {
  y: [0, 15, 0, 15, 0],
  rotate: [0, 15, 0, 15, 0],
  opacity: [0.4, 1, 0.4],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
};

const cookingEmojis = ["🥕", "🍳", "🧄", "🥦", "🍅", "🧂"];
const MotionBox = motion(Box);

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
        <Input placeholder="Ingredient" value={query} onChange={handleChange} />
      </PopoverTrigger>
      <PopoverContent maxH="200px" overflowY="auto" zIndex={999}>
        <List>
          {suggestions.map((name) => (
            <ListItem
              key={name}
              px={3}
              py={2}
              _hover={{ bg: "gray.100", cursor: "pointer" }}
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

export default function EditCustomRecipePage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [serving, setServing] = useState("");
  const [ingredients, setIngredients] = useState([
    { ingredient: "", quantity: "" },
  ]);
  const [steps, setSteps] = useState([""]);
  const [notes, setNotes] = useState("");

  const [floatingIcons, setFloatingIcons] = useState<React.ReactElement[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/account/signin");
      return;
    }
  }, [router]);

  // Load existing recipe data
  useEffect(() => {
    if (!params?.id) return;
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/custom-recipes/${params.id}`
        );
        const data = res.data;

        setTitle(data.title);
        setRecipeDescription(data.recipeDescription || "");
        setServing(data.serving || "");
        setIngredients(
          data.ingredients?.length
            ? data.ingredients
            : [{ ingredient: "", quantity: "" }]
        );
        setSteps(data.steps?.map((s: any) => s.description) || [""]);
        setNotes(data.notes || "");
        setLoading(false);
      } catch (err) {
        console.error("Error loading recipe:", err);
        toast({ status: "error", title: "Failed to load recipe" });
      }
    };
    fetchRecipe();
  }, [params?.id, toast]);

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

  const addIngredient = () =>
    setIngredients([...ingredients, { ingredient: "", quantity: "" }]);

  const deleteIngredient = (i: number) =>
    setIngredients(ingredients.filter((_, idx) => idx !== i));

  const addStep = () => setSteps([...steps, ""]);
  const deleteStep = (i: number) =>
    setSteps(steps.filter((_, idx) => idx !== i));

  const handleUpdate = async () => {
    if (!title.trim() || !recipeDescription.trim()) {
      return toast({
        status: "warning",
        title: "Title & description required",
      });
    }
    const servingsNum = Number(serving);
    if (!Number.isInteger(servingsNum) || servingsNum <= 0) {
      return toast({
        status: "warning",
        title: "Servings must be a positive whole number",
      });
    }

    // ✅ Remove empty steps before sending
    const filteredSteps = steps.filter((s) => s.trim() !== "");

    try {
      await axios.put(`http://localhost:5000/api/custom-recipes/${params.id}`, {
        title,
        recipeDescription,
        serving,
        ingredients,
        steps,
        notes,
      });
      toast({ status: "success", title: "Recipe updated!" });
      router.push(`/custom-recipes/${params.id}`);
    } catch (err) {
      console.error("Error updating recipe:", err);
      toast({ status: "error", title: "Failed to update recipe" });
    }
  };

  if (loading) return null;

  return (
    <Box bg="#fbfaf8" minH="100vh">
      <Navbar />

      {/* Floating background */}
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
        {/* Left panel - Edit form */}
        <MotionBox
          flex="1"
          bg="white"
          rounded="3xl"
          shadow="2xl"
          p={10}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Heading mb={6} color="#2d452c">
            Edit Custom Recipe ✏️
          </Heading>

          <VStack spacing={6} align="stretch">
            <Input
              placeholder="Recipe Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Short Description"
              value={recipeDescription}
              onChange={(e) => setRecipeDescription(e.target.value)}
            />
            <Input
              placeholder="Servings"
              type="number"
              value={serving}
              onChange={(e) => {
                const val = e.target.value;

                // Allow empty string so field can be cleared
                if (val === "") {
                  setServing("");
                  return;
                }

                // Only allow whole positive numbers
                if (/^\d+$/.test(val)) {
                  setServing(val);
                } else {
                  toast({
                    status: "error",
                    title: "Servings must be a whole number",
                    duration: 2000,
                  });
                }
              }}
            />

            <Divider />
            <Heading fontSize="lg">Ingredients</Heading>
            <AnimatePresence>
              {ingredients.map((ing, i) => (
                <MotionBox
                  key={i}
                  as={SimpleGrid}
                  columns={3}
                  spacing={2}
                  alignItems="center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <IngredientAutocompleteInput
                    value={ing.ingredient}
                    onChange={(val) => {
                      const updated = [...ingredients];
                      updated[i].ingredient = val;
                      setIngredients(updated);
                    }}
                  />
                  <Input
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i].quantity = e.target.value;
                      setIngredients(updated);
                    }}
                  />
                  <IconButton
                    aria-label="Delete"
                    icon={<CloseIcon />}
                    size="sm"
                    backgroundColor="#a32c2cff"
                    _hover={{ bg: "#611b1bff", color: "white" }}
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    onClick={() => deleteIngredient(i)}
                  />
                </MotionBox>
              ))}
            </AnimatePresence>
            <Button size="sm" onClick={addIngredient} bg="#cead7fff">
              + Add Ingredient
            </Button>

            <Divider />
            <Heading fontSize="lg">Steps</Heading>
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
                    backgroundColor="#a32c2cff"
                    _hover={{ bg: "#611b1bff", color: "white" }}
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    onClick={() => deleteStep(i)}
                  />
                </MotionBox>
              ))}
            </AnimatePresence>
            <Button size="sm" onClick={addStep} bg="#cead7fff">
              + Add Step
            </Button>

            <Textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button
              bg="#3c5b3a"
              color="white"
              size="lg"
              _hover={{ bg: "#086b08ff", color: "yellow" }}
              onClick={handleUpdate}
            >
              Update Recipe
            </Button>

            <Button
              bg="#a32c2cff"
              color="black"
              size="lg"
              _hover={{ bg: "#611b1bff", color: "white" }}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </VStack>
        </MotionBox>

        {/* Right panel - Live preview */}
        <MotionBox
          bg="white"
          rounded="3xl"
          shadow="2xl"
          p={8}
          flex="1"
          display={{ base: "none", md: "block" }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Heading mb={4} color="#2d452c">
            Live Preview 🧾
          </Heading>
          <Text fontWeight="bold" fontSize="2xl">
            {title || "Recipe Title"}
          </Text>
          <Text mb={2}>{recipeDescription || "Description goes here..."}</Text>
          <Text mb={4}>
            <b>Servings: </b> {serving || "-"}
          </Text>

          <Heading size="md" mt={3}>
            Ingredients
          </Heading>
          <ul>
            {ingredients.map(
              (ing, i) =>
                ing.ingredient && (
                  <li key={i}>
                    {ing.ingredient} — {ing.quantity}
                  </li>
                )
            )}
          </ul>

          <Heading size="md" mt={4}>
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

          <Heading size="md" mt={4}>
            Notes
          </Heading>
          <Text>{notes || "-"}</Text>
        </MotionBox>
      </Flex>
    </Box>
  );
}
