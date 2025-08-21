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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaLeaf, FaUtensils } from "react-icons/fa";

type Ingredient = {
  id: number;
  recipeId: number;
  ingredient: string;
  quantity?: string; // ✅ added quantity
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
        opacity={0.85} // ✅ stronger
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
        opacity={0.8} // ✅ stronger
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

      {/* Recipe Card */}
      <Flex justify="center" px={4} py={10} position="relative" zIndex={1}>
        <MotionBox
          {...fadeInUp}
          bg="#2d452c"
          color="white"
          borderRadius="2xl"
          p={10}
          w="100%"
          maxW="850px"
          boxShadow="2xl"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <Heading
            as="h1"
            fontSize="4xl"
            mb={3}
            textAlign="center"
            bgGradient="linear(to-r, green.100, yellow.200)"
            bgClip="text"
          >
            {recipe.title}
          </Heading>

          {/* Description */}
          <Text fontSize="lg" mb={4} color="whiteAlpha.900" textAlign="center">
            {recipe.recipeDescription}
          </Text>

          {/* Servings */}
          <Flex justify="center" mb={6}>
            <Badge
              px={4}
              py={2}
              borderRadius="full"
              fontSize="md"
              colorScheme="green"
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
              bg="whiteAlpha.200"
              p={5}
              borderRadius="lg"
              mb={6}
              border="1px solid"
              borderColor="whiteAlpha.400"
              boxShadow="md"
            >
              <Text fontWeight="bold" mb={2} color="#f7d099">
                Chef’s Notes
              </Text>
              <Text fontSize="md">{recipe.notes}</Text>
            </Box>
          )}

          <Divider borderColor="whiteAlpha.400" my={6} />

          {/* Ingredients */}
          <Heading
            as="h2"
            fontSize="2xl"
            mb={4}
            color="#f7d099"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <FaLeaf /> Ingredients
          </Heading>
          <VStack align="start" spacing={2} mb={6}>
            {recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing) => (
                <motion.div
                  key={ing.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Text
                    fontSize="md"
                    bg="whiteAlpha.200"
                    px={3}
                    py={1}
                    borderRadius="lg"
                    w="100%"
                  >
                    • {ing.quantity ? `${ing.quantity} ` : ""}
                    {ing.ingredient}
                  </Text>
                </motion.div>
              ))
            ) : (
              <Text color="whiteAlpha.700">No ingredients listed.</Text>
            )}
          </VStack>

          <Divider borderColor="whiteAlpha.400" my={6} />

          {/* Steps */}
          <Heading as="h2" fontSize="2xl" mb={4} color="#f7d099">
            Steps
          </Heading>
          <VStack align="start" spacing={4}>
            {recipe.steps.length > 0 ? (
              recipe.steps.map((step) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: "100%" }}
                >
                  <Box
                    bg="whiteAlpha.100"
                    p={4}
                    borderRadius="lg"
                    w="100%"
                    boxShadow="sm"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    <Text fontWeight="bold" color="green.100" mb={1}>
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

          <Divider borderColor="whiteAlpha.400" my={6} />

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
