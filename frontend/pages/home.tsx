"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  SimpleGrid,
  Button,
  Card,
  CardBody,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import axios from "axios";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const bounceButton = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const floatingAnimation = {
  y: [0, -10, 0, 10, 0],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

type RecentRecipe = {
  id: number;
  title?: string;
  recipeLink?: string;
  dateSaved?: string;
  created_at?: string;
};

export default function UserHome() {
  const [username, setUsername] = useState<string>("");
  const [savedCount, setSavedCount] = useState<number>(0);
  const [customCount, setCustomCount] = useState<number>(0);
  const [recent, setRecent] = useState<RecentRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/account/signin");
      return;
    }

    const user = JSON.parse(storedUser);
    const userId = user.id;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/home/${userId}`
        );
        const data = res.data;

        setUsername(data.username || user.name || "User");
        setSavedCount(data.savedCount || 0);
        setCustomCount(data.customCount || 0);
        setRecent(data.recent || []);
      } catch (err) {
        console.error("Failed to fetch home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fbfaf8">
        <Spinner size="xl" color="#3c5b3a" />
      </Flex>
    );
  }

  return (
    <Box bg="#fbfaf8" minH="100vh" position="relative" overflow="hidden">
      <Navbar />

      {/* Background Blobs */}
      <MotionBox
        position="absolute"
        w="350px"
        h="350px"
        borderRadius="full"
        bg="#faeddb"
        top="65%"
        left="-5%"
        zIndex={0}
        animate={floatingAnimation}
      />
      <MotionBox
        position="absolute"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="#cead7fff"
        top="10%"
        left="75%"
        zIndex={0}
        animate={floatingAnimation}
      />

      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        maxW="6xl"
        mx="auto"
        py={10}
        px={6}
        position="relative"
        zIndex={1}
      >
        {/* Greeting */}
        <MotionBox {...fadeInUp}>
          <Heading as="h1" fontSize="4xl" mb={2} color="#2d452c">
            Hi {username}! 👋 Welcome back!
          </Heading>
        </MotionBox>

        {/* Quick Actions */}
        <MotionBox
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Heading as="h2" fontSize="2xl" mb={4} mt={8} color="#2d452c">
            Quick Actions
          </Heading>
        </MotionBox>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          spacing={6}
          mb={10}
          mt={4}
        >
          {[
            {
              label: "Create a new recipe",
              route: "/create-recipe",
            },
            {
              label: "View saved recipes",
              route: "/saved-recipes",
            },
            {
              label: "Search grocery items",
              route: "/search-recipe", // ✅ This is the correct route
            },
            {
              label: "Manage account settings",
              route: "/account/settings",
            },
          ].map((action, i) => (
            <motion.div
              key={i}
              variants={bounceButton}
              whileHover={{ scale: 1.05 }}
              style={{ width: "100%", position: "relative" }}
            >
              <Button
                size="lg"
                bg="#3c5b3a"
                color="white"
                borderRadius="xl"
                _hover={{ bg: "#2d452c" }}
                w="100%"
                onClick={() => router.push(action.route)}
              >
                {action.label}
              </Button>

              {i === 0 && (
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ position: "absolute", top: 15, right: 20 }}
                >
                  <FaStar color="#FFD700" size="18" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </SimpleGrid>

        {/* Stats */}
        <MotionBox
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Heading as="h2" fontSize="2xl" mb={4} mt={8} color="#2d452c">
            Your Stats
          </Heading>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          {[customCount, savedCount, customCount + savedCount].map(
            (value, idx) => {
              const labels = [
                value > 0
                  ? `You’ve created ${value} custom recipe${
                      value > 1 ? "s" : ""
                    }!`
                  : "You have not created any recipes yet. Get started!",
                value > 0
                  ? `You’ve saved ${value} recipe${value > 1 ? "s" : ""}!`
                  : "You have not saved any recipes yet. Start saving your favorites!",
                value > 0
                  ? `You’ve cooked ${value} recipe${
                      value > 1 ? "s" : ""
                    } so far!`
                  : "Start cooking to see your progress here!",
              ];
              return (
                <MotionCard
                  key={idx}
                  {...fadeInUp}
                  bg="white"
                  shadow="md"
                  borderRadius="xl"
                >
                  <CardBody textAlign="center">
                    <Text fontSize="xl" color="#3c5b3a">
                      {labels[idx]}
                    </Text>
                  </CardBody>
                </MotionCard>
              );
            }
          )}
        </SimpleGrid>

        {/* Recent Activity */}
        <MotionBox
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Heading as="h2" fontSize="2xl" mb={4} mt={8} color="#2d452c">
            Recent Activity
          </Heading>
        </MotionBox>

        {recent.length > 0 ? (
          <VStack align="stretch" spacing={4}>
            {recent.map((item) => (
              <MotionCard
                key={item.id}
                {...fadeInUp}
                bg="white"
                shadow="sm"
                borderRadius="lg"
              >
                <CardBody>
                  <Text fontWeight="bold" color="#3c5b3a">
                    {item.title || "Saved recipe"}
                  </Text>
                  {item.recipeLink && (
                    <Text color="blue.500" wordBreak="break-word">
                      {item.recipeLink}
                    </Text>
                  )}
                  <Text fontSize="sm" color="gray.500">
                    {item.dateSaved || item.created_at || "No date available"}
                  </Text>
                </CardBody>
              </MotionCard>
            ))}
          </VStack>
        ) : (
          <MotionBox {...fadeInUp}>
            <Text fontSize="lg" color="#3c5b3a">
              You have no recent activity. Start by saving or creating a recipe!
            </Text>
          </MotionBox>
        )}
      </MotionBox>
    </Box>
  );
}
