"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "../../components/Navbar";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Flex,
  Spinner,
  Divider,
  Grid,
  GridItem,
} from "@chakra-ui/react";

type Ingredient = {
  id: number;
  recipeId: number;
  ingredient: string;
  quantity?: string;
  unit?: string;
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
  notes?: string | null;
  created_at: string;
  updated_at: string;
  ingredients: Ingredient[];
  steps: Step[];
};

export default function CustomRecipeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/custom-recipes/${id}`
        );

        const data = res.data;
        if (data.note && !data.notes) {
          data.notes = data.note;
        }

        setRecipe(data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fefae0">
        <Spinner size="xl" color="#d4a373" />
      </Flex>
    );
  }

  if (!recipe) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fefae0">
        <Text fontSize="xl" color="#d4a373">
          Recipe not found.
        </Text>
      </Flex>
    );
  }

  return (
    <Box bg="#ccd5ae" minH="100vh">
      <Navbar />
      <Flex justify="center" px={4} py={10}>
        <Box
          bg="white"
          borderRadius="2xl"
          p={10}
          w="100%"
          maxW="900px"
          boxShadow="lg"
        >
          {/* Title */}
          <Heading
            as="h1"
            fontSize="3xl"
            mb={2}
            textAlign="center"
            color="#344e41"
          >
            {recipe.title}
          </Heading>
          <Text fontSize="lg" mb={6} textAlign="center">
            {recipe.recipeDescription}
          </Text>

          {/* Meta Info */}
          <Flex
            justify="center"
            gap={8}
            mb={recipe.notes ? 4 : 8}
            flexWrap="wrap"
          >
            <Text color="#d4a373" fontWeight="medium">
              Servings: {recipe.serving}
            </Text>
          </Flex>

          {/* Notes */}
          {recipe.notes && (
            <Box
              mb={8}
              p={4}
              borderRadius="md"
              bg="#faedcd"
              border="1px solid #e9edc9"
            >
              <Heading as="h3" fontSize="lg" mb={2} color="#344e41">
                Notes
              </Heading>
              <Text color="gray.800">{recipe.notes}</Text>
            </Box>
          )}

          <Divider borderColor="#e9edc9" mb={8} />

          {/* Ingredients + Instructions */}
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 2fr" }}
            gap={10}
            alignItems="start"
          >
            {/* Ingredients */}
            <GridItem
              bg="#ccd5ae"
              borderRadius="md"
              p={6}
              border="1px solid #e9edc9"
            >
              <Heading as="h2" fontSize="2xl" mb={4} color="#344e41">
                Ingredients
              </Heading>
              <VStack align="start" spacing={3}>
                {recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ing) => (
                    <Text key={ing.id} color="gray.800">
                      • {ing.quantity ? `${ing.quantity} ` : ""}
                      {ing.unit ? `${ing.unit} ` : ""}
                      {ing.ingredient}
                    </Text>
                  ))
                ) : (
                  <Text color="gray.500">No ingredients listed.</Text>
                )}
              </VStack>
            </GridItem>

            {/* Instructions */}
            <GridItem
              bg="#faedcd"
              borderRadius="md"
              p={6}
              border="1px solid #e9edc9"
            >
              <Heading as="h2" fontSize="2xl" mb={4} color="#344e41">
                Instructions
              </Heading>
              <VStack align="start" spacing={5}>
                {recipe.steps.length > 0 ? (
                  recipe.steps.map((step) => (
                    <Box key={step.id}>
                      <Text fontWeight="bold" mb={1}>
                        Step {step.stepNumber}
                      </Text>
                      <Text color="gray.800">{step.description}</Text>
                    </Box>
                  ))
                ) : (
                  <Text color="gray.500">No steps listed.</Text>
                )}
              </VStack>
            </GridItem>
          </Grid>

          <Divider borderColor="#e9edc9" my={10} />

          {/* Edit + Send Buttons */}
          <Flex justify="center" gap={4}>
            <Button
              size="lg"
              bg="#d4a373"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
              onClick={() => router.push(`/custom-recipes/edit/${recipe.id}`)}
            >
              ✏️ Edit Recipe
            </Button>

            <Button
              size="lg"
              bg="#344e41"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
              onClick={() =>
                router.push(`/custom-recipes/${recipe.id}/grocery-list`)
              }
            >
              🛒 Send a grocery list
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
