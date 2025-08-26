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

// 🌿 Floating animation
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

// 🌿 Emojis for saved recipes
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

  // 🌿 Floating icons
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
      <Flex justify="center" align="center" minH="100vh" bg="#fefae0">
        <Spinner size="xl" color="#344e41" />
      </Flex>
    );
  }

  const customOnly = recipes.filter((r) => r.type === "custom");
  const savedOnly = recipes.filter((r) => r.type === "saved");

  return (
    <Box bg="#ccd5ae" minH="100vh" position="relative">
      <Navbar />

      {/* 🌿 Floating icons */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {floatingIcons}
      </Box>

      <Box maxW="7xl" mx="auto" py={10} px={6} position="relative" zIndex={1}>
        <Heading fontSize="4xl" mb={6} color="#344e41">
          Your Recipes 🍽️
        </Heading>

        <Button
          mb={6}
          onClick={() => setSorted((p) => !p)}
          bg="#d4a373"
          color="white"
          _hover={{ bg: "#ccd5ae", color: "black" }}
        >
          {sorted ? "See All Mixed" : "Sort Custom Recipes"}
        </Button>

        {recipes.length === 0 ? (
          <Text fontSize="lg" color="#344e41">
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
                      shadow="lg"
                      borderRadius="2xl"
                      border="1px solid #e9edc9"
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
                          borderTopRadius="2xl"
                        />
                      )}
                      <Box p={4}>
                        <Flex justify="space-between" mb={2}>
                          <Heading size="md" color="#344e41">
                            {recipe.title}
                          </Heading>
                          <Badge
                            bg={
                              recipe.type === "custom" ? "#ccd5ae" : "#faedcd"
                            }
                            color="#344e41"
                            borderRadius="full"
                            px={3}
                          >
                            {recipe.type}
                          </Badge>
                        </Flex>
                        <Button
                          size="sm"
                          bg="#344e41"
                          color="white"
                          _hover={{ bg: "#ccd5ae", color: "black" }}
                          onClick={() => {
                            if (recipe.type === "custom") {
                              router.push(`/custom-recipes/${recipe.id}`);
                            } else {
                              router.push(`/recipes/${recipe.id}`);
                            }
                          }}
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
                <Heading size="lg" mt={8} mb={4} color="#344e41">
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
                        shadow="lg"
                        border="1px solid #e9edc9"
                        borderRadius="2xl"
                        whileHover={{ scale: 1.03 }}
                      >
                        <Box p={4}>
                          <Flex justify="space-between" mb={2}>
                            <Heading size="md" color="#344e41">
                              {r.title}
                            </Heading>
                            <Badge
                              bg="#ccd5ae"
                              color="#344e41"
                              borderRadius="full"
                              px={3}
                            >
                              Custom
                            </Badge>
                          </Flex>
                          <Button
                            size="sm"
                            bg="#344e41"
                            color="white"
                            _hover={{ bg: "#ccd5ae", color: "black" }}
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

                <Heading size="lg" mt={12} mb={4} color="#344e41">
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
                        shadow="lg"
                        border="1px solid #e9edc9"
                        borderRadius="2xl"
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
                          borderTopRadius="2xl"
                        />
                        <Box p={4}>
                          <Flex justify="space-between" mb={2}>
                            <Heading size="md" color="#344e41">
                              {r.title}
                            </Heading>
                            <Badge
                              bg="#faedcd"
                              color="#344e41"
                              borderRadius="full"
                              px={3}
                            >
                              Saved
                            </Badge>
                          </Flex>
                          <Button
                            size="sm"
                            bg="#344e41"
                            color="white"
                            _hover={{ bg: "#ccd5ae", color: "black" }}
                            onClick={() => router.push(`/recipes/${r.id}`)}
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
