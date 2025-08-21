"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Navbar from "../../components/Navbar";

import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
  Divider,
} from "@chakra-ui/react";

type Ingredient = {
  id: number;
  recipeId: number;
  ingredient: string;
};

type Step = {
  id: number;
  recipeId: number;
  stepNumber: number;
  description: string;
};

type Recipe = {
  id: number;
  userId: number;
  title: string;
  recipeDescription: string;
  serving: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  ingredients: Ingredient[];
  steps: Step[];
};

export default function CustomRecipeDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/custom-recipes/${id}`
        );

        setRecipe(res.data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Box
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="xl">Recipe not found.</Text>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box maxW="800px" mx="auto" mt={8} px={4}>
        <Heading mb={2}>{recipe.title}</Heading>
        <Text fontSize="lg" color="gray.600">
          {recipe.recipeDescription}
        </Text>
        <Text fontSize="md" mt={2}>
          Servings: {recipe.serving}
        </Text>

        {recipe.notes && (
          <Box
            mt={4}
            p={3}
            bg="yellow.50"
            borderRadius="md"
            border="1px"
            borderColor="yellow.200"
          >
            <Text fontWeight="bold">Notes:</Text>
            <Text>{recipe.notes}</Text>
          </Box>
        )}

        <Divider my={6} />

        <Heading size="md" mb={3}>
          Ingredients
        </Heading>
        <VStack align="start" spacing={2}>
          {recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((ing) => (
              <Text key={ing.id}>• {ing.ingredient}</Text>
            ))
          ) : (
            <Text color="gray.500">No ingredients listed.</Text>
          )}
        </VStack>

        <Divider my={6} />

        <Heading size="md" mb={3}>
          Steps
        </Heading>
        <VStack align="start" spacing={2}>
          {recipe.steps.length > 0 ? (
            recipe.steps.map((step) => (
              <Text key={step.id}>
                <strong>Step {step.stepNumber}:</strong> {step.description}
              </Text>
            ))
          ) : (
            <Text color="gray.500">No steps listed.</Text>
          )}
        </VStack>

        <Divider my={6} />

        <Button
          colorScheme="blue"
          onClick={() => router.push(`/custom-recipes/edit/${recipe.id}`)}
        >
          Edit Recipe
        </Button>
      </Box>
    </>
  );
}
