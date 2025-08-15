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
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const floatingAnimation = {
  y: [0, -10, 0, 10, 0],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

type Recipe = {
  id: number;
  title: string;
  image?: string;
  type: "saved" | "custom";
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
    const userId = user.id;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/recipes/${userId}`
        );
        setRecipes(res.data || []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fbfaf8">
        <Spinner size="xl" color="#3c5b3a" />
      </Flex>
    );
  }

  return (
    <Box bg="#fbfaf8" minH="100vh" position="relative" overflow="hidden">
      <Navbar />

      {/* Floating background blobs */}
      <MotionBox
        position="absolute"
        w="350px"
        h="350px"
        borderRadius="full"
        bg="#faeddb"
        top="65%"
        left="-5%"
        zIndex={0}
        animate={floatingAnimation}
      />
      <MotionBox
        position="absolute"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="#cead7fff"
        top="10%"
        left="75%"
        zIndex={0}
        animate={floatingAnimation}
      />

      <MotionBox
        {...fadeInUp}
        maxW="7xl"
        mx="auto"
        py={10}
        px={6}
        position="relative"
        zIndex={1}
      >
        <Heading fontSize="4xl" mb={6} color="#2d452c">
          Your Recipes 🍽️
        </Heading>

        {recipes.length === 0 ? (
          <Text fontSize="lg" color="#3c5b3a">
            You have no saved or custom recipes yet. Start creating or saving to
            see them here!
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
            {Array.isArray(recipes) &&
              recipes.map((recipe, i) => (
                <MotionBox
                  key={recipe.id}
                  {...fadeInUp}
                  transition={{ delay: i * 0.05 }}
                  bg="white"
                  borderRadius="xl"
                  boxShadow="md"
                  overflow="hidden"
                  whileHover={{ scale: 1.03 }}
                >
                  <Image
                    src={
                      recipe.image ||
                      "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt={recipe.title}
                    w="100%"
                    h="200px"
                    objectFit="cover"
                  />
                  <Box p={4}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading fontSize="lg" color="#2d452c">
                        {recipe.title}
                      </Heading>
                      <Badge
                        colorScheme={
                          recipe.type === "custom" ? "green" : "yellow"
                        }
                        borderRadius="full"
                        px={2}
                        py={0.5}
                      >
                        {recipe.type === "custom" ? "Custom" : "Saved"}
                      </Badge>
                    </Flex>
                    <Button
                      bg="#3c5b3a"
                      color="white"
                      size="sm"
                      _hover={{ bg: "#2d452c" }}
                      onClick={() => router.push(`/recipe/${recipe.id}`)}
                    >
                      View Recipe
                    </Button>
                  </Box>
                </MotionBox>
              ))}
          </SimpleGrid>
        )}
      </MotionBox>
    </Box>
  );
}
