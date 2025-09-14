"use client";

import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaBook,
  FaSearch,
  FaClipboardList,
  FaPaperPlane,
  FaHeart,
  FaShare,
} from "react-icons/fa";
import Navbar from "../components/Navbar";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const features = [
  {
    icon: FaBook,
    title: "Create Your Own Recipe",
    description:
      "Create or import custom recipes with ease. Your personal recipe book at your fingertips.",
  },
  {
    icon: FaSearch,
    title: "Search for Recipes",
    description:
      "Enter a dish name and instantly see the top matching recipes with visuals and simplified ingredient info.",
  },
  {
    icon: FaClipboardList,
    title: "Customize Your Grocery List",
    description:
      "Select ingredients you already have, cross out what you don’t want, add custom items, and jot down notes.",
  },
  {
    icon: FaPaperPlane,
    title: "Send Ingredients via SMS or Email",
    description:
      "Choose how you want your grocery list delivered. We'll send only what you need—plus your notes.",
  },
  {
    icon: FaHeart,
    title: "Save & Manage Recipes",
    description:
      "Save any recipe to your personal collection. View or delete saved favorites at any time.",
  },
  {
    icon: FaShare,
    title: "Share Recipes With Friends",
    description:
      "Easily share your favorite recipes with friends and family via email or phone number.",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const floatingAnimation = {
  y: [0, -10, 0, 10, 0],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export default function FeaturesPage() {
  const cardBg = useColorModeValue("white", "#2d452c");
  const textColor = useColorModeValue("#344e41", "white");

  return (
    <Box bg="#ccd5ae" minH="100vh" position="relative" overflow="hidden">
      {/* Background Blobs (between background and content) */}
      <MotionBox
        position="absolute"
        w="350px"
        h="350px"
        borderRadius="full"
        bg="#faedcd"
        top="65%"
        left="5%"
        zIndex={0}
        opacity={0.7}
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
        opacity={0.7}
        animate={floatingAnimation}
      />

      {/* Foreground content */}
      <Box position="relative" zIndex={1} px={6} pb={6}>
        <Navbar />

        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          maxW="6xl"
          mx="auto"
          textAlign="center"
          mb={12}
        >
          <Heading fontSize="4xl" color="#344e41" mb={4}>
            Everything GottaGoGrocery Can Do
          </Heading>
          <Text fontSize="lg" color="#2d452c">
            From recipe inspiration to grocery prep, explore all the smart
            features that make your kitchen life easier.
          </Text>
        </MotionBox>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={10}
          maxW="6xl"
          mx="auto"
        >
          {features.map((feature, idx) => (
            <MotionVStack
              key={idx}
              {...fadeInUp}
              bg={cardBg}
              p={6}
              borderRadius="xl"
              shadow="lg"
              border="1px solid #e9edc9"
              align="start"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              spacing={4}
              position="relative" // allow absolute overlay
              overflow="hidden"
            >
              {/* Overlay for COMING SOON */}
              {feature.title === "Share Recipes With Friends" && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="rgba(255, 255, 255, 0.8)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="xl"
                  zIndex={2}
                >
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="#344e41"
                    transform="rotate(-15deg)"
                  >
                    🚧 COMING SOON 🚧
                  </Text>
                </Box>
              )}

              <Box
                bg="#d4a373"
                paddingTop={3}
                paddingBottom={1}
                px={3}
                borderRadius="full"
                boxShadow="0 0 15px #faedcd"
              >
                <Icon as={feature.icon} w={6} h={6} color="#fbfaf8" />
              </Box>
              <Heading size="md" color="#344e41">
                {feature.title}
              </Heading>
              <Text color={textColor}>{feature.description}</Text>
            </MotionVStack>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
