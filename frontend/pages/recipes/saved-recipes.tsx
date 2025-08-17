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
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
  transition: { duration: 0.5 },
};

// 🔸 NEW floating animation
const floatingEmojiAnimation = {
  y: [0, 15, 0, 15, 0],
  rotate: [0, 15, 0, -15, 0],
  opacity: [0.4, 1, 0.4],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// 🔸 Emojis related to SAVED recipes/snacks
const savedEmojis = ["📖", "👨‍🍳", "🥣", "✨", "🔥", "🥄", "🥗", "🍲"];

type Recipe = {
  id: number;
  title: string;
  image?: string;
  type: "saved" | "custom";
};

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorted, setSorted] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState<React.ReactElement[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/account/signin");
      return;
    }
    const user = JSON.parse(storedUser);
    async function fetchData() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/recipes/${user.id}`
        );
        setRecipes(res.data || []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  // 🔸 Generate floating saved-food icons
  useEffect(() => {
    const icons = [...Array(25)].map((_, i) => {
      const top = `${Math.random() * 90}%`;
      const left = `${Math.random() * 90}%`;
      const icon = savedEmojis[Math.floor(Math.random() * savedEmojis.length)];
      const rotation = Math.random() * 360;

      return (
        <MotionBox
          key={i}
          position="absolute"
          top={top}
          left={left}
          fontSize="26px"
          zIndex={0}
          style={{ transform: `rotate(${rotation}deg)` }}
          animate={floatingEmojiAnimation}
        >
          {icon}
        </MotionBox>
      );
    });
    setFloatingIcons(icons);
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fbfaf8">
        <Spinner size="xl" color="#3c5b3a" />
      </Flex>
    );
  }

  const customOnly = recipes.filter((r) => r.type === "custom");
  const savedOnly = recipes.filter((r) => r.type === "saved");

  return (
    <Box bg="#fbfaf8" minH="100vh" position="relative">
      <Navbar />

      {/* 🔸 Render icons behind the content */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {floatingIcons}
      </Box>

      <Box maxW="7xl" mx="auto" py={10} px={6} position="relative" zIndex={1}>
        <Heading fontSize="4xl" mb={6} color="#2d452c">
          Your Recipes 🍽️
        </Heading>

        <Button mb={6} onClick={() => setSorted((p) => !p)} bg="#cead7fff">
          {sorted ? "See All Mixed" : "Sort Custom Recipes"}
        </Button>

        {recipes.length === 0 ? (
          <Text fontSize="lg">
            You haven’t saved or created any recipes yet.
          </Text>
        ) : (
          <>
            {!sorted && (
              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                spacing={8}
              >
                <AnimatePresence>
                  {recipes.map((recipe, idx) => (
                    <MotionBox
                      key={recipe.id}
                      {...fadeInUp}
                      transition={{ delay: idx * 0.05 }}
                      bg="white"
                      shadow="md"
                      borderRadius="xl"
                      whileHover={{ scale: 1.03 }}
                    >
                      {recipe.type === "saved" && (
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
                      )}
                      <Box p={4}>
                        <Flex justify="space-between" mb={2}>
                          <Heading size="md" color="#2d452c">
                            {recipe.title}
                          </Heading>
                          <Badge
                            colorScheme={
                              recipe.type === "custom" ? "green" : "yellow"
                            }
                            borderRadius="full"
                            px={3}
                          >
                            {recipe.type}
                          </Badge>
                        </Flex>
                        <Button
                          size="sm"
                          bg="#3c5b3a"
                          color="white"
                          _hover={{ bg: "#2d452c" }}
                          onClick={() =>
                            router.push(`/custom-recipes/${recipe.id}`)
                          }
                        >
                          View
                        </Button>
                      </Box>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </SimpleGrid>
            )}

            {sorted && (
              <>
                <Heading size="lg" mt={8} mb={4}>
                  Custom Recipes
                </Heading>
                <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  spacing={8}
                >
                  <AnimatePresence>
                    {customOnly.map((r, idx) => (
                      <MotionBox
                        key={r.id}
                        {...fadeInUp}
                        transition={{ delay: idx * 0.05 }}
                        bg="white"
                        shadow="md"
                        borderRadius="xl"
                        whileHover={{ scale: 1.03 }}
                      >
                        <Box p={4}>
                          <Flex justify="space-between" mb={2}>
                            <Heading size="md" color="#2d452c">
                              {r.title}
                            </Heading>
                            <Badge
                              colorScheme="green"
                              borderRadius="full"
                              px={3}
                            >
                              Custom
                            </Badge>
                          </Flex>
                          <Button
                            size="sm"
                            bg="#3c5b3a"
                            color="white"
                            _hover={{ bg: "#2d452c" }}
                            onClick={() =>
                              router.push(`/custom-recipes/${r.id}`)
                            }
                          >
                            View
                          </Button>
                        </Box>
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                </SimpleGrid>

                <Heading size="lg" mt={12} mb={4}>
                  Saved Recipes
                </Heading>
                <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  spacing={8}
                >
                  <AnimatePresence>
                    {savedOnly.map((r, idx) => (
                      <MotionBox
                        key={r.id}
                        {...fadeInUp}
                        transition={{ delay: idx * 0.05 }}
                        bg="white"
                        shadow="md"
                        borderRadius="xl"
                        whileHover={{ scale: 1.03 }}
                      >
                        <Image
                          src={
                            r.image ||
                            "https://via.placeholder.com/400x300?text=No+Image"
                          }
                          alt={r.title}
                          w="100%"
                          h="200px"
                          objectFit="cover"
                        />
                        <Box p={4}>
                          <Flex justify="space-between" mb={2}>
                            <Heading size="md" color="#2d452c">
                              {r.title}
                            </Heading>
                            <Badge
                              colorScheme="yellow"
                              borderRadius="full"
                              px={2}
                            >
                              Saved
                            </Badge>
                          </Flex>
                          <Button
                            size="sm"
                            bg="#3c5b3a"
                            color="white"
                            _hover={{ bg: "#2d452c" }}
                            onClick={() =>
                              router.push(`/custom-recipes/${r.id}`)
                            }
                          >
                            View
                          </Button>
                        </Box>
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                </SimpleGrid>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
