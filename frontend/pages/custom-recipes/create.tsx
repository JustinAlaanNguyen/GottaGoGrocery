"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { findProfanity } from "../../utils/profanityFilter";
import QuantityUnitInput from "../../components/QuantityUnitInput";
import { formatQuantity } from "../../utils/formatFraction";

const floatingEmojiAnimation = {
  y: [0, 15, 0, 15, 0],
  rotate: [0, 15, 0, 15, 0],
  opacity: [0.4, 1, 0.4],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
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

  // ✅ Keep local query in sync with parent value
  useEffect(() => {
    setQuery(value);
  }, [value]);

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
          size={{ base: "lg", md: "md" }}
          fontSize={{ base: "md", md: "sm" }}
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
  interface Ingredient {
    id: number;
    ingredient: string;
    quantity: string;
    unit: string;
  }
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: Date.now(), ingredient: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState([""]);
  const [notes, setNotes] = useState("");
  const [floatingIcons, setFloatingIcons] = useState<React.ReactElement[]>([]);
  const [loading, setLoading] = useState(true);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [recipeUrl, setRecipeUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [author, setAuthor] = useState<string | null>(null);

  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

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

    // 🚨 Profanity check only on text-based fields
    // 🚨 Profanity check only on text-based fields
    const fieldsToCheck = [
      title,
      notes,
      ...ingredients.map((i) => i.ingredient),
    ];

    const badTokens = fieldsToCheck.flatMap((field) =>
      field ? findProfanity(field) : []
    );

    if (badTokens.length > 0) {
      console.error("Profanity detected:", badTokens);
      return toast({
        status: "error",
        title: "Inappropriate content detected",
        description: `Please remove profanity before saving. Offending words: ${badTokens.join(
          ", "
        )}`,
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

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("title", title);
    formData.append("recipeDescription", recipeDescription);
    formData.append("serving", serving);
    formData.append(
      "notes",
      author ? `Original recipe by ${author}\n\n${notes}` : notes
    );
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("steps", JSON.stringify(steps));

    if (image) {
      formData.append("image", image);
    } else if (imagePreview) {
      formData.append("imageUrl", imagePreview);
    }

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-recipes`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    toast({ status: "success", title: "Recipe created!" });
    router.push("/recipes/saved-recipes");
  };

  const handleExtractFromUrl = async () => {
    if (!recipeUrl.trim()) {
      return toast({ status: "warning", title: "Enter a recipe URL first" });
    }

    try {
      setIsExtracting(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-recipes/extract`,
        { url: recipeUrl }
      );
      const data = res.data;

      setTitle(data.title || "");
      setRecipeDescription(
        data.summary ? data.summary.replace(/<[^>]+>/g, "") : ""
      );
      setServing(data.servings?.toString() || "");

      // normalize ingredients so names never disappear
      setIngredients(
        (data.extendedIngredients || []).map((ing: any) => ({
          id: Date.now() + Math.random(), // make sure each has a unique id
          ingredient: ing.name || "",
          quantity: formatQuantity(ing.amount?.toString() || ""),
          unit: ing.unit || "",
        }))
      );

      // merge all instruction groups
      const mergedSteps =
        data.analyzedInstructions?.flatMap((group: any) =>
          group.steps.map((s: any) => s.step || "")
        ) || [];
      setSteps(mergedSteps.length > 0 ? mergedSteps : [""]);

      if (data.image) setImagePreview(data.image);
      if (data.creditsText) setAuthor(data.creditsText);

      toast({ status: "success", title: "Recipe imported!" });
    } catch (err) {
      console.error("Extract failed:", err);
      toast({ status: "error", title: "Could not extract recipe" });
    } finally {
      setIsExtracting(false);
    }
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
        py={{ base: 6, md: 14 }}
        px={{ base: 4, md: 6 }}
        gap={{ base: 6, md: 10 }}
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
        >
          <Heading mb={6} color="#344e41">
            Create a Custom Recipe 💡
          </Heading>

          {/* URL Autofill */}
          <Heading fontSize="md" color="#344e41">
            Have a recipe already? Import Recipe from a link!
          </Heading>
          <Flex gap={2} mb={4}>
            <Input
              fontStyle={"italic"}
              placeholder="Put link here..."
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              bg="white"
            />
            <Button
              onClick={handleExtractFromUrl}
              bg="#d4a373"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
              isLoading={isExtracting}
              loadingText="Autofilling..."
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              overflow="hidden"
              minW="120px"
            >
              Autofill
            </Button>
          </Flex>

          {/* Upload Image */}
          <Box>
            <Input
              id="recipe-image-upload"
              type="file"
              accept="image/*"
              display="none"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImage(file);
                if (file) setImagePreview(URL.createObjectURL(file));
              }}
            />
            <label htmlFor="recipe-image-upload">
              <Button as="span" bg="#d4a373" color="white">
                Upload Image
              </Button>
            </label>
            <Text mt={2} fontSize="sm" color="gray.600">
              {image ? image.name : "No recipe image chosen"}
            </Text>
          </Box>

          {/* Form */}
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
            // --- Ingredients Section in Main Component ---
            <Heading fontSize="lg" color="#344e41">
              Ingredients
            </Heading>
            <AnimatePresence>
              {ingredients.map((ing, i) => (
                <MotionBox
                  key={ing.id}
                  display={{ base: "flex", md: "grid" }}
                  gridTemplateColumns={{ md: "1fr 1fr auto" }}
                  flexDirection={{ base: "column", md: "initial" }}
                  gap={3}
                  alignItems="center"
                >
                  {/* Quantity + Unit side-by-side */}
                  <Flex gap={2} w="full">
                    <QuantityUnitInput
                      value={{ quantity: ing.quantity, unit: ing.unit }}
                      onChange={(val) => {
                        const updated = ingredients.map((item) =>
                          item.id === ing.id
                            ? {
                                ...item,
                                quantity: val.quantity,
                                unit: val.unit,
                              }
                            : item
                        );
                        setIngredients(updated);
                      }}
                    />
                    <IconButton
                      display={{ base: "flex", md: "none" }}
                      aria-label="Delete"
                      icon={<CloseIcon />}
                      size="sm"
                      bg="#a32c2c"
                      color="white"
                      _hover={{ bg: "#611b1b" }}
                      onClick={() => {
                        const updated = ingredients.filter(
                          (item) => item.id !== ing.id
                        );
                        setIngredients(
                          updated.length > 0
                            ? updated
                            : [
                                {
                                  id: Date.now(),
                                  ingredient: "",
                                  quantity: "",
                                  unit: "",
                                },
                              ]
                        );
                      }}
                    />
                  </Flex>

                  {/* Ingredient input */}
                  <IngredientAutocompleteInput
                    value={ing.ingredient}
                    onChange={(val) => {
                      const updated = ingredients.map((item) =>
                        item.id === ing.id ? { ...item, ingredient: val } : item
                      );
                      setIngredients(updated);
                    }}
                  />

                  {/* Delete button on desktop */}
                  <IconButton
                    display={{ base: "none", md: "flex" }}
                    aria-label="Delete"
                    icon={<CloseIcon />}
                    size="sm"
                    bg="#a32c2c"
                    color="white"
                    _hover={{ bg: "#611b1b" }}
                    onClick={() => {
                      const updated = ingredients.filter(
                        (item) => item.id !== ing.id
                      );
                      setIngredients(
                        updated.length > 0
                          ? updated
                          : [
                              {
                                id: Date.now(),
                                ingredient: "",
                                quantity: "",
                                unit: "",
                              },
                            ]
                      );
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
                  { id: Date.now(), ingredient: "", quantity: "", unit: "" },
                ])
              }
              bg="#d4a373"
              color="white"
            >
              + Add Ingredient
            </Button>
            <Divider borderColor="#e9edc9" />
            {/* Steps */}
            <Heading fontSize="lg" color="#344e41">
              Steps
            </Heading>
            <AnimatePresence>
              {steps.map((st, i) => (
                <MotionBox key={i} display="flex" gap={2} alignItems="center">
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
                    onClick={() => {
                      const updated = steps.filter((_, idx) => idx !== i);
                      setSteps(updated.length > 0 ? updated : [""]);
                    }}
                  />
                </MotionBox>
              ))}
            </AnimatePresence>
            <Button
              size="sm"
              onClick={() => setSteps([...steps, ""])}
              bg="#d4a373"
              color="white"
            >
              + Add Step
            </Button>
            {/* Notes */}
            <Textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              bg="#faedcd"
            />
            <Button bg="#344e41" color="white" size="lg" onClick={handleSubmit}>
              Save Recipe
            </Button>
            <Button
              bg="#d4a373"
              color="white"
              size="lg"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            {/* Mobile preview toggle */}
            <Button
              display={{ base: "block", md: "none" }}
              bg="#d4a373"
              color="white"
              onClick={() => {
                setShowMobilePreview(!showMobilePreview);
                if (!showMobilePreview) {
                  setTimeout(() => {
                    previewRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 200);
                }
              }}
            >
              {showMobilePreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </VStack>
        </MotionBox>

        {/* Right Panel Preview */}
        <MotionBox
          ref={previewRef}
          bg="white"
          rounded="2xl"
          shadow="lg"
          p={8}
          flex="1"
          border="1px solid #e9edc9"
          display={{ base: showMobilePreview ? "block" : "none", md: "block" }}
        >
          <Heading mb={4} color="#344e41">
            Live Preview 🧾
          </Heading>

          {imagePreview && (
            <Box mt={3}>
              <Heading size="sm">Photo Preview:</Heading>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            </Box>
          )}

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
                    {formatQuantity(ing.quantity)} {ing.unit} {ing.ingredient}
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
          {author && (
            <Box
              bg="#e9edc9"
              p={2}
              borderRadius="md"
              fontStyle="italic"
              fontSize="sm"
              color="gray.700"
            >
              Original recipe by {author}
            </Box>
          )}
          <Textarea
            placeholder="Your notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            bg="#faedcd"
          />
        </MotionBox>
      </Flex>
    </Box>
  );
}
