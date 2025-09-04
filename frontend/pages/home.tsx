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
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { FaExclamationCircle } from "react-icons/fa";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
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
  activityDate?: string;
  created_at?: string;
};

type Tasks = {
  addPhone: boolean;
  customRecipe: boolean;
  savedRecipe: boolean;
  sendEmail?: boolean;
  sendPhone?: boolean;
};

export default function UserHome() {
  const [username, setUsername] = useState<string>("");
  const [savedCount, setSavedCount] = useState<number>(0);
  const [customCount, setCustomCount] = useState<number>(0);
  const [recent, setRecent] = useState<RecentRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Tasks>({
    addPhone: false,
    customRecipe: false,
    savedRecipe: false,
    sendEmail: false,
    sendPhone: false,
  });
  const [showTasks, setShowTasks] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const allCompleted = Object.values(tasks).every(Boolean);
  const router = useRouter();

  // 🔑 reusable fetchData function
  const fetchData = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/home/${userId}`
      );
      const data = res.data;

      setUsername(data.username || "User");
      setSavedCount(data.savedCount || 0);
      setCustomCount(data.customCount || 0);
      setRecent(data.recent || []);
      setTasks(
        data.tasks || {
          addPhone: false,
          customRecipe: false,
          savedRecipe: false,
          sendEmail: false,
          sendPhone: false,
        }
      );
    } catch (err) {
      console.error("Failed to fetch home data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 load user + fetch tasks on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/account/signin");
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user.id) {
      router.push("/account/signin");
      return;
    }

    setUserId(user.id);
  }, [router]);

  // 🔑 refetch whenever userId is set
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // 🔑 refresh tasks when user comes back to this page
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [userId]);

  // 🔑 optimistic update
  const markTaskCompleted = (id: keyof Tasks) => {
    setTasks((prev) => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fbfaf8">
        <Spinner size="xl" color="#3c5b3a" />
      </Flex>
    );
  }

  return (
    <Box bg="#ccd5ae" minH="100vh" position="relative" overflow="hidden">
      <Navbar />

      {/* Background Blobs */}
      <MotionBox
        position="absolute"
        w="350px"
        h="350px"
        borderRadius="full"
        bg="#faedcd"
        top="65%"
        left="5%"
        zIndex={0}
        animate={floatingAnimation}
      />
      <MotionBox
        position="absolute"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="#fcd4a1"
        top="10%"
        left="80%"
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
          <Heading as="h1" fontSize="6xl" mb={2} color="#344e41">
            Hi {username}! 👋 Lets get cooking!
          </Heading>
        </MotionBox>

        {/* Getting Started Tasks */}
        {!allCompleted && (
          <>
            <MotionBox
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            >
              <Flex align="center" mb={4} mt={8} padding={2} gap={4}>
                <Heading as="h2" fontSize="4xl" color="#344e41">
                  Getting Started
                </Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTasks(!showTasks)}
                  leftIcon={showTasks ? <ChevronUpIcon /> : <ChevronDownIcon />}
                >
                  {showTasks ? "Hide" : "Show"}
                </Button>
              </Flex>
            </MotionBox>

            {showTasks && (
              <VStack align="stretch" spacing={4}>
                {[
                  {
                    id: "addPhone",
                    label: "Add your phone number to your account",
                    route: "/account/profile",
                  },
                  {
                    id: "customRecipe",
                    label: "Create a custom recipe",
                    route: "/custom-recipes",
                  },
                  {
                    id: "savedRecipe",
                    label: "Search up and save a new recipe",
                    route: "/search-recipe",
                  },
                  {
                    id: "sendEmail",
                    label: "Send a grocery list to your email",
                    route: "/recipes/saved-recipes",
                  },
                  {
                    id: "sendPhone",
                    label: "Send a grocery list to your phone number",
                    route: "/recipes/saved-recipes",
                  },
                ].map((task) => {
                  const completed = tasks[task.id as keyof Tasks];
                  return (
                    <MotionCard
                      key={task.id}
                      {...fadeInUp}
                      bg={completed ? "green.50" : "white"}
                      shadow="sm"
                      borderRadius="lg"
                      position="relative"
                    >
                      <CardBody>
                        <Flex justify="space-between" align="center">
                          <Text
                            fontWeight="600"
                            color={completed ? "gray.500" : "#344e41"}
                            textDecoration={completed ? "line-through" : "none"}
                          >
                            {task.label}
                          </Text>
                          <Flex align="center" gap={2}>
                            {!completed && (
                              <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                }}
                              >
                                <FaExclamationCircle
                                  color="#d9534f"
                                  size={20}
                                />
                              </motion.div>
                            )}
                            <Button
                              size="sm"
                              colorScheme={completed ? "green" : "blue"}
                              onClick={() => {
                                if (!completed) {
                                  markTaskCompleted(task.id as keyof Tasks); // optimistic ✅
                                  router.push(task.route); // go do the task
                                }
                              }}
                            >
                              {completed ? "Done ✅" : "Start"}
                            </Button>
                          </Flex>
                        </Flex>
                      </CardBody>
                    </MotionCard>
                  );
                })}
              </VStack>
            )}
          </>
        )}

        {/* Stats */}
        <MotionBox
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Heading as="h2" fontSize="4xl" mb={4} mt={8} color="#344e41">
            Your Stats
          </Heading>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          <MotionCard {...fadeInUp} bg="white" shadow="md" borderRadius="xl">
            <CardBody textAlign="center">
              <Text fontSize="xl" color="#344e41" fontWeight="600">
                {customCount > 0
                  ? `You’ve created ${customCount} custom recipe${
                      customCount > 1 ? "s" : ""
                    }!`
                  : "You have not created any recipes yet. Get started!"}
              </Text>
            </CardBody>
          </MotionCard>

          <MotionCard {...fadeInUp} bg="white" shadow="md" borderRadius="xl">
            <CardBody textAlign="center">
              <Text fontSize="xl" color="#344e41" fontWeight="600">
                {savedCount > 0
                  ? `You’ve saved ${savedCount} recipe${
                      savedCount > 1 ? "s" : ""
                    }!`
                  : "You have not saved any recipes yet. Start saving your favorites!"}
              </Text>
            </CardBody>
          </MotionCard>

          <MotionCard {...fadeInUp} bg="white" shadow="md" borderRadius="xl">
            <CardBody textAlign="center">
              <Text fontSize="xl" color="#344e41" fontWeight="600">
                {customCount + savedCount > 0
                  ? `You’ve cooked ${customCount + savedCount} recipe${
                      customCount + savedCount > 1 ? "s" : ""
                    } so far!`
                  : "Start cooking to see your progress here!"}
              </Text>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Recent Activity */}
        <MotionBox
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Heading as="h2" fontSize="4xl" mb={4} mt={8} color="#344e41">
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
                  <Text fontWeight="600" color="#344e41">
                    {item.title || "Saved recipe"}
                  </Text>
                  <Text
                    color="blue.500"
                    wordBreak="break-word"
                    fontWeight="500"
                  >
                    {item.recipeLink}
                  </Text>
                  <Text fontSize="sm" color="gray.500" fontWeight="500">
                    {item.activityDate
                      ? new Date(item.activityDate).toLocaleString()
                      : "No date available"}
                  </Text>
                </CardBody>
              </MotionCard>
            ))}
          </VStack>
        ) : (
          <MotionBox {...fadeInUp}>
            <Text fontSize="lg" color="#344e41" fontWeight="700">
              You have no recent activity. Start by saving or creating a recipe!
            </Text>
          </MotionBox>
        )}
      </MotionBox>
    </Box>
  );
}
