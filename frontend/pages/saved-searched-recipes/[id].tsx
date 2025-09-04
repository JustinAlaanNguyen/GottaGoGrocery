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

type SavedRecipe = {
  id: number;
  userId: number;
  recipeApiId?: number;
  recipeLink?: string;
  title: string;
  image?: string | null;
  notes?: string | null;
  dateSaved: string;
  ingredients?: { id: number; original: string }[];
};

export default function SavedRecipeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/saved-recipes/${id}`
        );
        setRecipe(res.data);
      } catch (error) {
        console.error("Error fetching saved recipe:", error);
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
          Saved recipe not found.
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

          {/* Ingredients (if you store them later) */}
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 2fr" }}
            gap={10}
            alignItems="start"
          >
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
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ing) => (
                    <Text key={ing.id} color="gray.800">
                      • {ing.original}
                    </Text>
                  ))
                ) : (
                  <Text color="gray.500">
                    Ingredients available in recipe link.
                  </Text>
                )}
              </VStack>
            </GridItem>

            <GridItem
              bg="#faedcd"
              borderRadius="md"
              p={6}
              border="1px solid #e9edc9"
            >
              <Heading as="h2" fontSize="2xl" mb={4} color="#344e41">
                Instructions
              </Heading>
              <Text color="gray.600" mb={4}>
                View full instructions here:
              </Text>
              {recipe.recipeLink ? (
                <Button
                  as="a"
                  href={recipe.recipeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  bg="#344e41"
                  color="white"
                  _hover={{ bg: "#ccd5ae", color: "black" }}
                >
                  📖 Open Recipe Instructions
                </Button>
              ) : (
                <Text color="gray.500">No instructions available.</Text>
              )}
            </GridItem>
          </Grid>

          <Divider borderColor="#e9edc9" my={10} />

          {/* Buttons */}
          <Flex justify="center" gap={4}>
            <Button
              size="lg"
              bg="#344e41"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
              onClick={() =>
                router.push(`/saved-recipes/${recipe.id}/grocery-list`)
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
