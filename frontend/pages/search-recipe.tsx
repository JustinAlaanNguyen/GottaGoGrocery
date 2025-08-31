"use client";

import {
  Box,
  Heading,
  Input,
  VStack,
  SimpleGrid,
  Image,
  Text,
  Card,
  CardBody,
  Spinner,
  Button,
} from "@chakra-ui/react";
import React, { useState, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type Recipe = {
  id: number;
  title: string;
  image: string;
  ingredientCount: number;
};

export default function SearchRecipe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const cutleryEmojis = ["🍴", "🥄"];

  const cutlery = useMemo(() => {
    return [...Array(30)].map((_, i) => {
      const top = `${Math.random() * 80 + 5}%`;
      const left = `${Math.random() * 90 + 5}%`;
      const duration = Math.random() * 4 + 3;
      const emoji =
        cutleryEmojis[Math.floor(Math.random() * cutleryEmojis.length)];

      return (
        <MotionBox
          key={i}
          position="absolute"
          top={top}
          left={left}
          zIndex={0}
          opacity={0.8}
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [0, -10, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        >
          <Text fontSize="lg">{emoji}</Text>
        </MotionBox>
      );
    });
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

      // Step 1: Search recipes
      const res = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch`,
        {
          params: {
            query: searchTerm,
            number: 6,
            sort: "relevant",
            apiKey,
          },
        }
      );

      const recipesData = res.data.results;

      // Step 2: Fetch full info for each recipe to get ingredients
      const detailedRecipes = await Promise.all(
        recipesData.map(async (r: any) => {
          try {
            const details = await axios.get(
              `https://api.spoonacular.com/recipes/${r.id}/information`,
              { params: { apiKey } }
            );
            return {
              id: r.id,
              title: r.title,
              image: r.image,
              ingredientCount: details.data.extendedIngredients?.length || 0,
            };
          } catch (error) {
            console.error("Error fetching details:", error);
            return {
              id: r.id,
              title: r.title,
              image: r.image,
              ingredientCount: 0,
            };
          }
        })
      );

      setRecipes(detailedRecipes);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      pt={0} // 🔹 no padding on top
      px={6} // 🔹 keep side padding
      pb={6} // 🔹 keep bottom padding
      bg="#ccd5ae"
      position="relative"
      overflow="hidden"
    >
      {/* Floating background icons */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {cutlery}
      </Box>

      <Navbar />

      <Heading mb={6} textAlign="center" color="#2d452c">
        Search for a Recipe 🍽️
      </Heading>

      <VStack spacing={4} mb={8}>
        <Input
          placeholder="Enter dish name..."
          size="lg"
          borderRadius="full"
          bg="white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="500px"
          focusBorderColor="#cead7f"
        />
        <Button
          onClick={handleSearch}
          bg="#3c5b3a"
          color="white"
          size="lg"
          borderRadius="xl"
          _hover={{ bg: "#2d452c" }}
        >
          Search
        </Button>
      </VStack>

      {loading ? (
        <Spinner size="xl" color="#3c5b3a" />
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              bg="white"
              borderRadius="xl"
              shadow="md"
              _hover={{ transform: "scale(1.02)" }}
              transition="0.2s"
            >
              <CardBody>
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  borderRadius="md"
                  mb={3}
                />
                <Text fontWeight="bold" fontSize="lg" color="#3c5b3a">
                  {recipe.title}
                </Text>
                <Text color="#2d452c">
                  Ingredients: {recipe.ingredientCount}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
