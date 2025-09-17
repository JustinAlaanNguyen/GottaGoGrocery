"use client";

import {
  Box,
  Heading,
  Input,
  VStack,
  SimpleGrid,
  Image,
  Text,
  Flex,
  Badge,
  Skeleton,
  Button,
  HStack,
  Select,
  Stack,
} from "@chakra-ui/react";
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

const MotionBox = motion(Box);

type Recipe = {
  id: number;
  title: string;
  image: string;
  ingredientCount: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
  transition: { duration: 0.4 },
};

export default function SearchRecipe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    cuisine: "",
    diet: "",
    intolerances: "",
  });
  const router = useRouter();
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
          <Text fontSize="26px">{emoji}</Text>
        </MotionBox>
      );
    });
  }, []);

  const handleSearch = async (isLoadMore = false) => {
    if (!searchTerm) return;
    if (!isLoadMore) {
      setRecipes([]);
      setOffset(0);
    }
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

      const res = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch`,
        {
          params: {
            query: searchTerm,
            number: 6,
            offset: isLoadMore ? offset + 6 : 0,
            sort: "relevant",
            apiKey,
            ...filters,
          },
        }
      );

      const recipesData = res.data.results;

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
              image: details.data.image || r.image, // 👈 use high-res from info endpoint
              ingredientCount: details.data.extendedIngredients?.length || 0,
              vegetarian: details.data.vegetarian,
              vegan: details.data.vegan,
              glutenFree: details.data.glutenFree,
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

      setRecipes((prev) =>
        isLoadMore ? [...prev, ...detailedRecipes] : detailedRecipes
      );
      setOffset((prev) => (isLoadMore ? prev + 6 : 0));

      if (!isLoadMore) {
        setSearchHistory((prev) => {
          const updated = [searchTerm, ...prev.filter((t) => t !== searchTerm)];
          return updated.slice(0, 3); // last 3
        });
      }
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      px={6}
      pb={6}
      bg="#ccd5ae"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {cutlery}
      </Box>

      <Navbar />

      <Heading mb={6} textAlign="center" color="#2d452c">
        Search for a Recipe 🍽️
      </Heading>

      {/* Filters & Search */}
      <VStack spacing={4} mb={8}>
        <Input
          placeholder="Enter dish name..."
          size="lg"
          borderRadius="full"
          bg="white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="500px"
          transition="all 0.3s ease"
          _focus={{ transform: "scale(1.05)", borderColor: "#cead7f" }}
        />
        <Stack
          spacing={6}
          direction={{ base: "column", md: "row" }} // column on mobile, row on desktop
          w="100%"
          maxW="800px"
        >
          <Select
            flex="1"
            placeholder="Cuisine"
            value={filters.cuisine}
            onChange={(e) =>
              setFilters({ ...filters, cuisine: e.target.value })
            }
          >
            <option value="italian">Italian</option>
            <option value="mexican">Mexican</option>
            <option value="chinese">Chinese</option>
            <option value="indian">Indian</option>
          </Select>

          <Select
            flex="1"
            placeholder="Diet"
            value={filters.diet}
            onChange={(e) => setFilters({ ...filters, diet: e.target.value })}
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="paleo">Paleo</option>
          </Select>

          <Select
            flex="1"
            placeholder="Intolerances"
            value={filters.intolerances}
            onChange={(e) =>
              setFilters({ ...filters, intolerances: e.target.value })
            }
          >
            <option value="dairy">Dairy-Free</option>
            <option value="egg">Egg-Free</option>
            <option value="gluten">Gluten-Free</option>
            <option value="peanut">Peanut-Free</option>
            <option value="seafood">Seafood-Free</option>
            <option value="sesame">Sesame-Free</option>
            <option value="soy">Soy-Free</option>
            <option value="tree nut">Tree Nut-Free</option>
            <option value="wheat">Wheat-Free</option>
          </Select>
        </Stack>

        <Button
          onClick={() => handleSearch(false)}
          bg="#3c5b3a"
          color="white"
          size="lg"
          borderRadius="xl"
          _hover={{ bg: "#2d452c" }}
        >
          Search
        </Button>
        {/* Search History */}
        <HStack spacing={3}>
          <h1> Recent Searches:</h1>
          {searchHistory.map((term, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchTerm(term);
                handleSearch(false);
              }}
            >
              {term}
            </Button>
          ))}
        </HStack>
      </VStack>

      {loading ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} borderRadius="2xl" overflow="hidden" shadow="md">
              <Skeleton height="220px" />
              <Box p={4}>
                <Skeleton height="20px" mb={2} />
                <Skeleton height="14px" width="60%" />
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      ) : recipes.length === 0 ? (
        <Flex direction="column" align="center" mt={10}>
          <Text fontSize="4xl">🔍</Text>
          <Heading size="md" color="#344e41" mb={2}>
            No results found
          </Heading>
          <Text color="#344e41">Try another search or adjust filters!</Text>
        </Flex>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
            {recipes.map((recipe, idx) => (
              <MotionBox
                key={recipe.id}
                {...fadeInUp}
                transition={{ delay: idx * 0.05 }}
                position="relative"
                overflow="hidden"
                borderRadius="2xl"
                shadow="lg"
                bg="white"
                border="1px solid #e9edc9"
                whileHover={{ scale: 1.02 }}
                cursor="pointer"
                onClick={() => router.push(`/search-recipes/${recipe.id}`)} // 👈 entire card clickable
              >
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  w="100%"
                  h="220px"
                  objectFit="cover"
                />

                {/* Overlay (desktop only) */}
                <MotionBox
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  position="absolute"
                  inset={0}
                  bg="rgba(52, 78, 65, 0.7)"
                  display={{ base: "none", md: "flex" }} // 👈 hidden on mobile
                  alignItems="center"
                  justifyContent="center"
                >
                  <Button
                    size="sm"
                    bg="#faedcd"
                    color="#344e41"
                    _hover={{ bg: "white" }}
                    onClick={(e) => {
                      e.stopPropagation(); // prevent firing the card click twice
                      router.push(`/search-recipes/${recipe.id}`);
                    }}
                  >
                    View Recipe
                  </Button>
                </MotionBox>

                <Box p={4}>
                  <Heading size="sm" color="#344e41" noOfLines={1}>
                    {recipe.title}
                  </Heading>
                  <Text color="#2d452c" fontSize="sm">
                    {recipe.vegetarian
                      ? "🥕 Vegetarian"
                      : recipe.vegan
                      ? "🥦 Vegan"
                      : recipe.glutenFree
                      ? "🌾 Gluten-Free"
                      : "🍖 Contains Meat"}
                  </Text>
                  <HStack mt={2}>
                    {recipe.vegetarian && (
                      <Badge colorScheme="green">Veg</Badge>
                    )}
                    {recipe.vegan && <Badge colorScheme="purple">Vegan</Badge>}
                    {recipe.glutenFree && (
                      <Badge colorScheme="yellow">Gluten-Free</Badge>
                    )}
                  </HStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>

          <Flex justify="center" mt={8}>
            <Button
              onClick={() => handleSearch(true)}
              bg="#d4a373"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
            >
              Load More
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
}
