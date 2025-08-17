"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Spinner,
  VStack,
  List,
  ListItem,
  Button,
  Divider,
} from "@chakra-ui/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type RecipeDetails = {
  title: string;
  recipeDescription: string;
  serving: number;
  ingredients: { ingredient: string; quantity: string }[];
  steps: { stepNumber: number; description: string }[];
  notes: string;
};

export default function CustomRecipeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params || {};

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/account/signin");
      return;
    }
    async function fetchRecipe() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/custom-recipes/${id}`
        );
        setRecipe(res.data);
      } catch (e) {
        console.error("Error fetching details:", e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRecipe();
  }, [id, router]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#3c5b3a">
        <Spinner size="xl" color="white" />
      </Flex>
    );
  }

  if (!recipe) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#3c5b3a">
        <Text color="white">Recipe not found.</Text>
      </Flex>
    );
  }

  // ✂️ Extract "Notes:" from inside description
  let description = recipe.recipeDescription;
  let extractedNotes: string | undefined;

  if (description.includes("Notes:")) {
    const parts = description.split("Notes:");
    description = parts[0].trim();
    extractedNotes = parts[1].trim();
  }

  return (
    <Box bg="#3c5b3a" minH="100vh">
      <Navbar />

      {/* Hero Header */}
      <Box py={14} px={4} color="white" textAlign="center">
        <Heading fontSize="4xl" mb={3}>
          {recipe.title}
        </Heading>
        <Text maxW="3xl" mx="auto" fontSize="lg">
          {description}
        </Text>
      </Box>

      {/* Content */}
      <MotionBox
        maxW="4xl"
        mx="auto"
        mt={-12}
        p={10}
        bg="white"
        rounded="3xl"
        shadow="2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Text mb={4} fontSize="lg">
          <strong>Servings:</strong> {recipe.serving}
        </Text>

        <Heading size="md" mb={3} color="#2d452c">
          Ingredients
        </Heading>
        <List pl={6} mb={6} styleType="disc">
          {recipe.ingredients.map((ing, i) => (
            <ListItem key={i}>
              <strong>{ing.ingredient}</strong> — {ing.quantity}
            </ListItem>
          ))}
        </List>

        <Divider />

        <Heading size="md" mt={6} mb={3} color="#2d452c">
          Steps
        </Heading>
        <VStack align="stretch" spacing={4}>
          {recipe.steps.map((step, index) => (
            <Box
              key={index}
              bg="#f8f8f8"
              p={4}
              borderRadius="md"
              borderLeft="6px solid #3c5b3a"
            >
              <Text fontWeight="bold" mb={2}>
                Step {step.stepNumber}
              </Text>
              <Text>{step.description}</Text>
            </Box>
          ))}
        </VStack>

        {/* Provided notes in separate DB field  */}
        {(recipe.notes || extractedNotes) && (
          <>
            <Divider />
            <Heading size="md" mt={6} mb={3} color="#2d452c">
              Notes
            </Heading>
            <Text>{recipe.notes || extractedNotes}</Text>
          </>
        )}

        <Flex mt={10} gap={4} justify="flex-end">
          <Button
            variant="outline"
            borderColor="#3c5b3a"
            color="#3c5b3a"
            _hover={{ bg: "#e1e4e3" }}
            onClick={() => router.push(`/custom-recipes/edit/${id}`)}
          >
            Edit Recipe
          </Button>
          <Button bg="#3c5b3a" color="white" _hover={{ bg: "#2d452c" }}>
            Grocery List
          </Button>
        </Flex>
      </MotionBox>
    </Box>
  );
}
