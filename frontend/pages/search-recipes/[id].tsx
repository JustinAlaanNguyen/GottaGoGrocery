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
  Image,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";

type Ingredient = {
  id: number;
  original: string; // Spoonacular gives full string like "1 cup sugar"
};

type Step = {
  number: number;
  step: string;
};

type RecipeDetails = {
  sourceUrl: any;
  id: number;
  title: string;
  image: string;
  servings: number;
  summary: string;
  extendedIngredients: Ingredient[];
  analyzedInstructions: { steps: Step[] }[];
};

export default function SpoonacularRecipeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    const fetchRecipe = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
        const res = await axios.get(
          `https://api.spoonacular.com/recipes/${id}/information`,
          { params: { apiKey } }
        );
        setRecipe(res.data);
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
          {/* Recipe Image */}
          {recipe.image && (
            <Box mb={6} display="flex" justifyContent="center">
              <Image
                src={recipe.image}
                alt={recipe.title}
                borderRadius="lg"
                maxH="400px"
                objectFit="cover"
                boxShadow="md"
              />
            </Box>
          )}

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
          <Text
            fontSize="lg"
            mb={6}
            textAlign="center"
            dangerouslySetInnerHTML={{ __html: recipe.summary }}
          />

          {/* Meta Info */}
          <Flex justify="center" gap={8} mb={8} flexWrap="wrap">
            <Text color="#d4a373" fontWeight="medium">
              Servings: {recipe.servings}
            </Text>
          </Flex>

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
                {recipe.extendedIngredients?.length > 0 ? (
                  recipe.extendedIngredients.map((ing) => (
                    <Text key={ing.id} color="gray.800">
                      • {ing.original}
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
                {recipe.analyzedInstructions?.[0]?.steps?.length > 0 ? (
                  recipe.analyzedInstructions[0].steps.map((step) => (
                    <Box key={step.number}>
                      <Text fontWeight="bold" mb={1}>
                        Step {step.number}
                      </Text>
                      <Text color="gray.800">{step.step}</Text>
                    </Box>
                  ))
                ) : (
                  <Text color="gray.500">No steps listed.</Text>
                )}
              </VStack>
            </GridItem>

            <Flex justify="center" gap={4} mt={10}>
              <Button
                size="lg"
                bg="#d4a373"
                color="white"
                _hover={{ bg: "#ccd5ae", color: "black" }}
                onClick={() => router.back()}
              >
                ⬅ Go Back
              </Button>

              <Button
                size="lg"
                bg="#344e41"
                color="white"
                _hover={{ bg: "#ccd5ae", color: "black" }}
                onClick={async () => {
                  try {
                    const storedUser = localStorage.getItem("user");
                    if (!storedUser) {
                      toast({
                        status: "warning",
                        title: "Please sign in first.",
                      });
                      router.push("/account/signin");
                      return;
                    }

                    const user = JSON.parse(storedUser);

                    await axios.post(
                      "http://localhost:5000/api/saved-recipes/save",
                      {
                        userId: user.id,
                        recipeApiId: recipe.id,
                        recipeLink: recipe.sourceUrl,
                        title: recipe.title,
                        image: recipe.image,
                      }
                    );

                    toast({
                      status: "success",
                      title: "Recipe saved successfully! 💾",
                      description: `${recipe.title} was added to your saved recipes.`,
                      duration: 3000,
                      isClosable: true,
                    });

                    // ✅ Give toast time to show before redirect
                    setTimeout(() => {
                      router.push(
                        "http://localhost:3000/recipes/saved-recipes"
                      );
                    }, 1500);
                  } catch (err) {
                    console.error("Error saving recipe", err);
                    toast({
                      status: "error",
                      title: "Failed to save recipe",
                      description: "Please try again later.",
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              >
                💾 Save This Recipe
              </Button>
            </Flex>
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
}
