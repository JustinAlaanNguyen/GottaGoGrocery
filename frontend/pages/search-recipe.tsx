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
import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

type Recipe = {
  id: number;
  title: string;
  image: string;
  missedIngredientCount: number;
  usedIngredientCount: number;
};

export default function SearchRecipe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
      const res = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch`,
        {
          params: {
            query: searchTerm,
            number: 6,
            addRecipeInformation: true,
            apiKey: apiKey,
          },
        }
      );

      const results = res.data.results.map((r: any) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        usedIngredientCount: r.usedIngredientCount || 0,
        missedIngredientCount: r.missedIngredientCount || 0,
      }));

      setRecipes(results);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" p={6} bg="#fbfaf8">
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
            <Card key={recipe.id} bg="white" borderRadius="xl" shadow="md">
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
                <Text color="gray.600">
                  Ingredients:{" "}
                  {recipe.usedIngredientCount + recipe.missedIngredientCount}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
