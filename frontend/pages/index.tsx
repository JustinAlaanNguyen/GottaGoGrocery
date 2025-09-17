import React from "react";
import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import NextLink from "next/link";
import PhoneVideoPlayer from "../components/PhoneVideoPlayer";

const MotionText = motion(Text);
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// 🌊 Floating animation for circles
const floatingAnimation = {
  y: [0, -7, 0, 7, 0],
  scale: [1, 1.05, 1, 1.05, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// 🌿 Branch + Leaf component (relative to phone)
const BranchWithLeaf = ({
  branchTop,
  branchLeft,
  branchWidth,
  branchRotate,
  branchGradient,
  leafTop,
  leafLeft,
  leafWidth,
  leafRotate,
  swayRange,
}: {
  branchTop: string;
  branchLeft: string;
  branchWidth: string;
  branchRotate: number;
  branchGradient: string;
  leafTop: string;
  leafLeft: string;
  leafWidth: string;
  leafRotate: number;
  swayRange: number[];
}) => (
  <>
    {/* 🍃 Leaf */}
    <MotionBox
      position="absolute"
      width={leafWidth}
      height="30px"
      bg="#2d452c"
      borderRadius="50%"
      top={leafTop}
      left={leafLeft}
      style={{
        transformOrigin: "right center",
        transform: `rotate(${leafRotate}deg)`,
      }}
      zIndex={1}
      animate={{ rotate: swayRange }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    {/* 🌿 Branch */}
    <MotionBox
      position="absolute"
      width={branchWidth}
      height="1px"
      borderRadius="full"
      top={branchTop}
      left={branchLeft}
      style={{
        transformOrigin: "right center",
        transform: `rotate(${branchRotate}deg)`,
      }}
      zIndex={1}
      bgGradient={branchGradient}
      animate={{ rotate: swayRange }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </>
);

const HomePage: React.FC = () => {
  return (
    <Box
      bgGradient="linear(to-b, #ccd5ae, #ccd5ae, #e0e8c2)"
      minH="100vh"
      position="relative"
      overflow="hidden"
    >
      <Navbar />

      {/* ✅ Mobile View */}
      <MotionFlex
        display={{ base: "flex", md: "none" }}
        direction="column"
        align="center"
        justify="center"
        maxW="full"
        mx="auto"
        px={8}
        py={16}
        textAlign="center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        position="relative"
      >
        {/* 🎈 Floating Circle Top-Left */}
        <MotionBox
          position="absolute"
          w="180px"
          h="180px"
          borderRadius="full"
          bg="#faedcd"
          bottom="69%"
          right="65%"
          style={{ transform: "translate(-50%, -50%)" }}
          zIndex={0}
          animate={floatingAnimation}
        />

        {/* 🎈 Floating Circle Bottom-Right */}
        <MotionBox
          position="absolute"
          w="220px"
          h="220px"
          borderRadius="full"
          bg="#cead7f"
          bottom="0%"
          right="-15%"
          style={{ transform: "translate(50%, 50%)" }}
          zIndex={0}
          animate={floatingAnimation}
        />

        {/* 🍞 Subtle Grocery Emoji Watermarks */}
        <MotionText
          position="absolute"
          fontSize="10rem"
          bottom="-5%"
          right="-12%"
          opacity={0.5}
          zIndex={0}
          animate={floatingAnimation}
        >
          🥖
        </MotionText>
        <MotionText
          position="absolute"
          fontSize="4rem"
          bottom="85%"
          right="69%"
          opacity={0.5}
          zIndex={0}
          animate={floatingAnimation}
        >
          🍅
        </MotionText>
        <MotionText
          position="absolute"
          fontSize="4rem"
          bottom="69%"
          right="80%"
          opacity={0.5}
          zIndex={0}
          animate={floatingAnimation}
        >
          🥬
        </MotionText>

        {/* ✅ Content */}
        <Heading
          as="h1"
          fontSize="4xl"
          color="#344e41"
          mb={8}
          lineHeight="1.2"
          zIndex={1}
        >
          Get Your Grocery List Sorted
        </Heading>
        <Text fontSize="lg" color="#344e41" mb={12} zIndex={1}>
          Simplify your meal planning and grocery shopping by searching for
          recipes and sending the ingredients to your phone.
        </Text>
        <NextLink href="/account/signup">
          <Button
            size="lg"
            bg="#d4a373"
            color="white"
            fontSize="xl"
            px={8}
            py={6}
            zIndex={1}
            borderRadius="full"
            _hover={{ bg: "#faedcd", color: "#344e41" }}
          >
            Get Started
          </Button>
        </NextLink>
      </MotionFlex>

      {/* ✅ Desktop/Laptop View */}
      <MotionFlex
        display={{ base: "none", md: "flex" }}
        direction="row"
        align="center"
        justify="space-between"
        maxW="7xl"
        mx="auto"
        px={16}
        py={32}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Left Side */}
        <MotionBox
          flex="1"
          pr={{ md: 24 }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Heading
            as="h1"
            fontSize="6xl"
            color="#344e41"
            mb={12}
            lineHeight="1.2"
          >
            Get Your Grocery List Sorted
          </Heading>
          <Text fontSize="2xl" color="#344e41" mb={16}>
            Simplify your meal planning and grocery shopping by searching for
            recipes and sending the ingredients to your phone.
          </Text>
          <NextLink href="/account/signup">
            <Button
              size="lg"
              bg="#d4a373"
              color="white"
              fontSize="2xl"
              px={12}
              py={8}
              borderRadius="full"
              _hover={{ bg: "#faedcd", color: "#344e41" }}
            >
              Get Started
            </Button>
          </NextLink>
        </MotionBox>

        {/* Right Side (Phone + Leaves) */}
        <MotionBox
          flex="1"
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* 🎨 Animated Background Circles */}
          <MotionBox
            position="absolute"
            w="400px"
            h="400px"
            borderRadius="full"
            bg="#faedcd"
            top="-16%"
            left="-10%"
            style={{ transform: "translate(-50%, -50%)" }}
            zIndex={0}
            animate={floatingAnimation}
          />
          <MotionBox
            position="absolute"
            w="300px"
            h="300px"
            borderRadius="full"
            bg="#cead7f"
            top="30%"
            left="55%"
            style={{ transform: "translate(-50%, -50%)" }}
            zIndex={0}
            animate={floatingAnimation}
          />
          <MotionBox
            position="absolute"
            w="200px"
            h="200px"
            borderRadius="full"
            bg="#fcd4a1"
            top="80%"
            left="-5%"
            style={{ transform: "translate(-50%, -50%)" }}
            zIndex={0}
            animate={floatingAnimation}
          />

          {/* 📱 Phone Wrapper (relative, NO overflow clipping) */}
          <Box position="relative" w={{ md: "260px", lg: "300px" }} zIndex={2}>
            {/* 🌿 Leaves attached to phone */}
            <BranchWithLeaf
              branchTop="20%"
              branchLeft="-60px"
              branchWidth="60px"
              branchRotate={-45}
              branchGradient="linear(to-r, #9c9a9aff 60%, black 40%)"
              leafTop="14%"
              leafLeft="-100px"
              leafWidth="90px"
              leafRotate={-45}
              swayRange={[70, 62, 70, 62, 70]}
            />
            <BranchWithLeaf
              branchTop="80%"
              branchLeft="80%"
              branchWidth="60px"
              branchRotate={135}
              branchGradient="linear(to-r, #9c9a9aff 60%, black 40%)"
              leafTop="74.4%"
              leafLeft="75%"
              leafWidth="90px"
              leafRotate={135}
              swayRange={[135, 125, 135, 125, 135]}
            />

            {/* 📱 Actual Phone (inside wrapper) */}
            <Box
              border="10px solid #e9edc9"
              borderRadius="50px"
              overflow="hidden"
              boxShadow="xl"
              aspectRatio={9 / 16}
              w="full"
              bg="black"
            >
              <PhoneVideoPlayer />
            </Box>
          </Box>
        </MotionBox>
      </MotionFlex>
    </Box>
  );
};

export default HomePage;
