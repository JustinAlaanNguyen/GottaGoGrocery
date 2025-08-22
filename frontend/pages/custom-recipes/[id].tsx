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
  Badge,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaClipboardList, FaUtensils, FaCheck } from "react-icons/fa";

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
  notes: string | null;
  created_at: string;
  updated_at: string;
  ingredients: Ingredient[];
  steps: Step[];
};

const MotionBox = motion(Box);

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const floatingAnimation = {
  y: [0, -15, 0, 15, 0],
  transition: {
    duration: 10,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const sparkleAnimation = {
  scale: [1, 1.5, 1],
  opacity: [0.3, 1, 0.3],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
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
      <Flex justify="center" align="center" minH="100vh" bg="#fbfaf8">
        <Spinner size="xl" color="#3c5b3a" />
      </Flex>
    );
  }

  if (!recipe) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fbfaf8">
        <Text fontSize="xl" color="#2d452c">
          Recipe not found.
        </Text>
      </Flex>
    );
  }

  return (
    <Box bg="#fbfaf8" minH="100vh" position="relative" overflow="hidden">
      <Navbar />

      {/* Background Blobs */}
      <MotionBox
        position="absolute"
        w="450px"
        h="450px"
        borderRadius="full"
        bg="#fae0c3"
        top="5%"
        left="-8%"
        zIndex={0}
        animate={floatingAnimation}
        filter="blur(30px)"
        opacity={0.85}
      />
      <MotionBox
        position="absolute"
        w="350px"
        h="350px"
        borderRadius="full"
        bg="#d4a86a"
        top="70%"
        left="75%"
        zIndex={0}
        animate={floatingAnimation}
        filter="blur(40px)"
        opacity={0.8}
      />

      {/* Sparkles ✨ */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "white",
            opacity: 0.6,
          }}
          animate={sparkleAnimation}
        />
      ))}

      {/* Recipe Container */}
      <Flex justify="center" px={4} py={10} position="relative" zIndex={1}>
        <MotionBox
          {...fadeInUp}
          bg="#2d452c"
          color="white"
          borderRadius="2xl"
          p={10}
          w="100%"
          maxW="1000px"
          boxShadow="2xl"
        >
          {/* Header */}
          <Heading
            as="h1"
            fontSize="5xl"
            mb={2}
            textAlign="center"
            bgGradient="linear(to-r, green.100, yellow.200)"
            bgClip="text"
          >
            {recipe.title}
          </Heading>
          <Text fontSize="lg" mb={4} textAlign="center" color="whiteAlpha.800">
            {recipe.recipeDescription}
          </Text>
          <Flex justify="center" mb={8}>
            <Badge
              px={5}
              py={2}
              borderRadius="full"
              fontSize="lg"
              bg="#f7d099"
              color="#2d452c"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <FaUtensils /> Serves {recipe.serving}
            </Badge>
          </Flex>

          {/* Notes */}
          {recipe.notes && (
            <Box
              bg="#fae0c3"
              p={5}
              borderRadius="xl"
              mb={8}
              boxShadow="md"
              color="#2d452c"
            >
              <Text fontWeight="bold" mb={2}>
                Chef’s Notes
              </Text>
              <Text fontSize="md">{recipe.notes}</Text>
            </Box>
          )}

          {/* Ingredients + Steps Grid */}
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 2fr" }}
            gap={10}
            alignItems="start"
          >
            {/* Ingredients */}
            <GridItem>
              <Heading as="h2" fontSize="2xl" mb={4} color="#f7d099">
                <Flex align="center" gap={2}>
                  <FaClipboardList />
                  Ingredients
                </Flex>
              </Heading>

              <VStack
                align="start"
                spacing={3}
                bg="whiteAlpha.100"
                p={6}
                borderRadius="xl"
              >
                {recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ing) => (
                    <motion.div
                      key={ing.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: "100%" }}
                    >
                      <Text fontSize="md" color="whiteAlpha.900">
                        • {ing.quantity ? `${ing.quantity} ` : ""}
                        {ing.unit ? `${ing.unit} ` : ""}
                        {ing.ingredient}
                      </Text>
                    </motion.div>
                  ))
                ) : (
                  <Text color="whiteAlpha.700">No ingredients listed.</Text>
                )}
              </VStack>
            </GridItem>

            {/* Steps */}
            <GridItem>
              <Heading as="h2" fontSize="2xl" mb={4} color="#f7d099">
                <Flex align="center" gap={2}>
                  <FaCheck />
                  Steps
                </Flex>
              </Heading>
              <VStack align="start" spacing={5}>
                {recipe.steps.length > 0 ? (
                  recipe.steps.map((step) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ width: "100%" }}
                    >
                      <Box
                        bg="whiteAlpha.100"
                        p={5}
                        borderRadius="lg"
                        w="100%"
                        boxShadow="sm"
                        borderLeft="4px solid #f7d099"
                      >
                        <Text
                          fontWeight="bold"
                          color="yellow.200"
                          mb={2}
                          fontSize="lg"
                        >
                          Step {step.stepNumber}
                        </Text>
                        <Text>{step.description}</Text>
                      </Box>
                    </motion.div>
                  ))
                ) : (
                  <Text color="whiteAlpha.700">No steps listed.</Text>
                )}
              </VStack>
            </GridItem>
          </Grid>

          <Divider borderColor="whiteAlpha.400" my={10} />

          {/* Edit Button */}
          <Flex justify="center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                bgGradient="linear(to-r, green.400, yellow.400)"
                color="white"
                borderRadius="xl"
                _hover={{
                  bgGradient: "linear(to-r, green.300, yellow.300)",
                }}
                onClick={() => router.push(`/custom-recipes/edit/${recipe.id}`)}
              >
                ✏️ Edit Recipe
              </Button>
            </motion.div>
          </Flex>
        </MotionBox>
      </Flex>
    </Box>
  );
}
