"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Spinner,
  Button,
  Badge,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

type Recipe = {
  id: number;
  title: string;
  image?: string;
  type: "saved" | "custom";
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
  transition: { duration: 0.4 },
};

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/account/signin");
      return;
    }
    const user = JSON.parse(storedUser);
    async function fetchData() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/recipes/${user.id}`
        );
        setRecipes(res.data || []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const customOnly = recipes.filter((r) => r.type === "custom");
  const savedOnly = recipes.filter((r) => r.type === "saved");

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fefae0">
        <Spinner size="xl" color="#344e41" />
      </Flex>
    );
  }

  const EmptyState = ({ type }: { type: "all" | "custom" | "saved" }) => {
    if (type === "custom") {
      return (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="300px"
          textAlign="center"
          gap={4}
        >
          <Text fontSize="4xl">✨</Text>
          <Heading size="md" color="#344e41">
            No custom recipes yet
          </Heading>
          <Text color="#344e41">Start by creating your first recipe!</Text>
          <Button
            bg="#d4a373"
            color="white"
            _hover={{ bg: "#ccd5ae", color: "black" }}
            onClick={() => router.push("/custom-recipes/create")}
          >
            ➕ Create Recipe
          </Button>
        </Flex>
      );
    }

    if (type === "saved") {
      return (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="300px"
          textAlign="center"
          gap={4}
        >
          <Text fontSize="4xl">🔍</Text>
          <Heading size="md" color="#344e41">
            No saved recipes yet
          </Heading>
          <Text color="#344e41">Start by searching for a recipe!</Text>
          <Button
            bg="#d4a373"
            color="white"
            _hover={{ bg: "#ccd5ae", color: "black" }}
            onClick={() => router.push("/search-recipe")}
          >
            🔎 Search Recipe
          </Button>
        </Flex>
      );
    }

    // type === "all"
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="300px"
        textAlign="center"
        gap={4}
      >
        <Text fontSize="4xl">🍴</Text>
        <Heading size="md" color="#344e41">
          No recipes found
        </Heading>
        <Text color="#344e41">
          You don’t have any custom or saved recipes yet.
        </Text>
        <Flex gap={4} wrap="wrap" justify="center">
          <Button
            bg="#d4a373"
            color="white"
            _hover={{ bg: "#ccd5ae", color: "black" }}
            onClick={() => router.push("/custom-recipes/create")}
          >
            ➕ Create Recipe
          </Button>
          <Button
            bg="#344e41"
            color="white"
            _hover={{ bg: "#ccd5ae", color: "black" }}
            onClick={() => router.push("/search-recipe")}
          >
            🔎 Search Recipe
          </Button>
        </Flex>
      </Flex>
    );
  };

  const RecipeGrid = ({ list }: { list: Recipe[] }) => (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8} w="100%">
      <AnimatePresence>
        {list.map((recipe, idx) => (
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
          >
            <Image
              src={
                recipe.image
                  ? recipe.image // already a full URL from backend
                  : "https://via.placeholder.com/400x300?text=Custom+Recipe"
              }
              alt={recipe.title}
              w="100%"
              h="220px"
              objectFit="cover"
            />

            {/* Overlay on hover */}
            <MotionBox
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              position="absolute"
              inset={0}
              bg="rgba(52, 78, 65, 0.7)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Button
                size="sm"
                bg="#faedcd"
                color="#344e41"
                _hover={{ bg: "white" }}
                onClick={() => {
                  if (recipe.type === "custom") {
                    router.push(`/custom-recipes/${recipe.id}`);
                  } else {
                    router.push(`/saved-searched-recipes/${recipe.id}`);
                  }
                }}
              >
                View Recipe
              </Button>
            </MotionBox>

            {/* Card footer */}
            <Box p={4}>
              <Flex justify="space-between" align="center">
                <Heading size="sm" color="#344e41" noOfLines={1}>
                  {recipe.title}
                </Heading>
                <Badge
                  bg={recipe.type === "custom" ? "#ccd5ae" : "#faedcd"}
                  color="#344e41"
                  borderRadius="full"
                  px={3}
                >
                  {recipe.type}
                </Badge>
              </Flex>
            </Box>
          </MotionBox>
        ))}
      </AnimatePresence>
    </SimpleGrid>
  );

  return (
    <Box bg="#fefae0" minH="100vh">
      <Navbar />
      <Box maxW="7xl" mx="auto" py={10} px={6}>
        <Heading fontSize="4xl" mb={8} color="#344e41">
          Your Recipes 🍽️
        </Heading>

        <Tabs variant="soft-rounded" colorScheme="green" isFitted>
          <TabList mb={6}>
            <Tab>All</Tab>
            <Tab>Custom</Tab>
            <Tab>Saved</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {recipes.length === 0 ? (
                <EmptyState type="all" />
              ) : (
                <RecipeGrid list={recipes} />
              )}
            </TabPanel>
            <TabPanel>
              {customOnly.length === 0 ? (
                <EmptyState type="custom" />
              ) : (
                <RecipeGrid list={customOnly} />
              )}
            </TabPanel>
            <TabPanel>
              {savedOnly.length === 0 ? (
                <EmptyState type="saved" />
              ) : (
                <RecipeGrid list={savedOnly} />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
