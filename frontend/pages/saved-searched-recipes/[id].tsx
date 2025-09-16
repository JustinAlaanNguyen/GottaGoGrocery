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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/saved-recipes/${id}`
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/saved-recipes/${id}`
      );
      router.push("/recipes/saved-recipes");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
    }
  };

  return (
    <Box bg="#ccd5ae" minH="100vh">
      <Navbar />
      <Flex justify="center" px={{ base: 2, md: 4 }} py={{ base: 6, md: 10 }}>
        <Box
          bg="white"
          borderRadius="2xl"
          p={{ base: 4, md: 10 }}
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
                maxH={{ base: "250px", md: "400px" }}
                w="100%"
                objectFit="cover"
                boxShadow="md"
              />
            </Box>
          )}

          {/* Title */}
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "3xl" }}
            mb={4}
            textAlign="center"
            color="#344e41"
            wordBreak="break-word"
          >
            {recipe.title}
          </Heading>

          {/* Notes */}
          {recipe.notes && (
            <Box
              mb={8}
              p={{ base: 3, md: 4 }}
              borderRadius="md"
              bg="#faedcd"
              border="1px solid #e9edc9"
            >
              <Heading
                as="h3"
                fontSize={{ base: "md", md: "lg" }}
                mb={2}
                color="#344e41"
              >
                Notes
              </Heading>
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.800">
                {recipe.notes}
              </Text>
            </Box>
          )}

          <Divider borderColor="#e9edc9" mb={8} />

          {/* Ingredients & Instructions */}
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 2fr" }}
            gap={{ base: 6, md: 10 }}
            alignItems="start"
          >
            {/* Ingredients */}
            <GridItem
              bg="#ccd5ae"
              borderRadius="md"
              p={{ base: 4, md: 6 }}
              border="1px solid #e9edc9"
            >
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                mb={4}
                color="#344e41"
              >
                Ingredients
              </Heading>
              <VStack align="start" spacing={3}>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ing) => (
                    <Text
                      key={ing.id}
                      color="gray.800"
                      fontSize={{ base: "sm", md: "md" }}
                      wordBreak="break-word"
                    >
                      • {ing.original}
                    </Text>
                  ))
                ) : (
                  <Text fontSize={{ base: "sm", md: "md" }} color="gray.500">
                    Ingredients available in recipe link.
                  </Text>
                )}
              </VStack>
            </GridItem>

            {/* Instructions */}
            <GridItem
              bg="#faedcd"
              borderRadius="md"
              p={{ base: 4, md: 6 }}
              border="1px solid #e9edc9"
            >
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                mb={4}
                color="#344e41"
              >
                Instructions
              </Heading>
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" mb={4}>
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
                  size={{ base: "md", md: "lg" }}
                  _hover={{ bg: "#ccd5ae", color: "black" }}
                  w="100%"
                  whiteSpace="normal"
                  textAlign="center"
                >
                  📖 Open Recipe Instructions
                </Button>
              ) : (
                <Text fontSize={{ base: "sm", md: "md" }} color="gray.500">
                  No instructions available.
                </Text>
              )}
            </GridItem>
          </Grid>

          <Divider borderColor="#e9edc9" my={10} />

          {/* Buttons */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="center"
            gap={4}
          >
            <Button
              size={{ base: "md", md: "lg" }}
              bg="#344e41"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
              onClick={() =>
                router.push(`/saved-searched-recipes/${recipe.id}/grocery-list`)
              }
              w={{ base: "100%", sm: "auto" }}
              whiteSpace="normal"
              textAlign="center"
            >
              🛒 Send a grocery list
            </Button>

            <Button
              size={{ base: "md", md: "lg" }}
              bg="red.600"
              color="white"
              _hover={{ bg: "red.400", color: "black" }}
              onClick={handleDelete}
              w={{ base: "100%", sm: "auto" }}
              whiteSpace="normal"
              textAlign="center"
            >
              🗑️ Delete Recipe
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
