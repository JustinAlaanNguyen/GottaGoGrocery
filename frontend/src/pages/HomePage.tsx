import React from "react";
import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const floatingAnimation = {
  y: [0, -10, 0, 10, 0], // up and down
  scale: [1, 1.05, 1, 1.08, 1], // pulsing
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const HomePage: React.FC = () => {
  return (
    <Box bg="#fbfaf8" minH="100vh" position="relative" overflow="hidden">
      <Navbar />

      <MotionFlex
        direction={{ base: "column", md: "row" }}
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
          pr={{ base: 0, md: 24 }}
          mb={{ base: 24, md: 0 }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Heading
            as="h1"
            fontSize="6xl"
            color="black"
            mb={12}
            lineHeight="1.2"
          >
            Get Your Grocery List Sorted
          </Heading>
          <Text fontSize="2xl" color="black" mb={16}>
            Simplify your meal planning and grocery shopping by searching for
            recipes and sending the ingredients to your phone.
          </Text>
          <Button
            size="lg"
            bg="#3c5b3a"
            color="white"
            fontSize="2xl"
            px={12}
            py={8}
            borderRadius="full"
            _hover={{ bg: "#2d452c" }}
          >
            Get Started
          </Button>
        </MotionBox>

        {/* Right Side */}
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
          {/* Animated circles behind */}
          <MotionBox
            position="absolute"
            w="400px"
            h="400px"
            borderRadius="full"
            bg="#faeddb"
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
            bg="#cead7fff"
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
          {/* 🌿 Animated Branches */}\{/* 🍃 Leaf attached to Branch 1 */}
          <MotionBox
            position="absolute"
            width="80px" // width of the ellipse
            height="30px" // height of the ellipse
            bg="#2d452c" // leaf color
            borderRadius="50%" // makes it elliptical
            top="67%"
            left="6.5%"
            style={{
              transformOrigin: "right center", // sway around the attachment point
              // shift the leaf slightly so it appears around the branch's colored part
              transform: "translate(-10px, -50%) rotate(-45deg)",
            }}
            zIndex={0}
            animate={{
              rotate: [50, 45, 50, 45, 50],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Branch 1 */}
          <MotionBox
            position="absolute"
            width="50px"
            height="1px"
            bg="#ffffffff"
            borderRadius="full"
            top="69%"
            left="13%"
            style={{
              transformOrigin: "right center",
              transform: "translate(-50%, -50%) rotate(-45deg)", // angled higher
            }}
            zIndex={0}
            animate={{
              rotate: [45, 40, 45, 40, 45], // oscillate around -45°
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* 🍃 Leaf attached to Branch 2 */}
          <MotionBox
            position="absolute"
            width="90px" // width of the ellipse
            height="30px" // height of the ellipse
            bg="#2d452c" // leaf color
            borderRadius="50%" // makes it elliptical
            top="58.5%" // same top as branch to align
            left="3.5%" // same left as branch
            style={{
              transformOrigin: "right center", // sway around the attachment point
              // shift the leaf slightly so it appears around the branch's colored part
              transform: "translate(-10px, -50%) rotate(-45deg)",
            }}
            zIndex={0}
            animate={{
              rotate: [70, 62, 70, 62, 70], // same as branch
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Branch 2 */}
          <MotionBox
            position="absolute"
            width="60px"
            height="1px"
            borderRadius="full"
            top="65%"
            left="11%"
            style={{
              transformOrigin: "right center",
              transform: "translate(-50%, -50%) rotate(-45deg)",
            }}
            zIndex={0}
            bgGradient="linear(to-r, #ffffffff 60%,  black 40%)"
            animate={{
              rotate: [69, 65, 69, 65, 69],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* 🍃 Leaf attached to Branch 3 */}
          <MotionBox
            position="absolute"
            width="100px" // width of the ellipse
            height="30px" // height of the ellipse
            bg="#2d452c" // leaf color
            borderRadius="50%" // makes it elliptical
            top="35%" // same top as branch to align
            left="61.5%" // same left as branch
            style={{
              transformOrigin: "right center", // sway around the attachment point
              // shift the leaf slightly so it appears around the branch's colored part
              transform: "translate(-10px, -50%) rotate(-45deg)",
            }}
            zIndex={0}
            animate={{
              rotate: [130, 135, 130, 135, 130], // same as branch
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Branch 3 */}
          <MotionBox
            position="absolute"
            width="90px"
            height="1px"
            bg="black"
            borderRadius="full"
            top="40%"
            left="61%"
            style={{
              transformOrigin: "right center",
              transform: "translate(-50%, -50%) rotate(-90deg)", // angled higher
            }}
            zIndex={0}
            bgGradient="linear(to-r, #fffffeff 78%,  black 22%)"
            animate={{
              rotate: [130, 135, 130, 135, 130], // oscillate around -45°
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* 🍃 Leaf attached to Branch 4 */}
          <MotionBox
            position="absolute"
            width="100px" // width of the ellipse
            height="30px" // height of the ellipse
            bg="#2d452c" // leaf color
            borderRadius="50%" // makes it elliptical
            top="27%" // same top as branch to align
            left="61%" // same left as branch
            style={{
              transformOrigin: "right center", // sway around the attachment point
              // shift the leaf slightly so it appears around the branch's colored part
              transform: "translate(-10px, -50%) rotate(-45deg)",
            }}
            zIndex={0}
            animate={{
              rotate: [100, 95, 100, 95, 100], // same as branch
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Branch 4 */}
          <MotionBox
            position="absolute"
            width="90px"
            height="1px"
            bg="black"
            borderRadius="full"
            top="35%"
            left="62%"
            style={{
              transformOrigin: "right center",
              transform: "translate(-50%, -50%) rotate(-45deg)", // angled higher
            }}
            zIndex={0}
            bgGradient="linear(to-r, #fffffeff 60%,  black 40%)"
            animate={{
              rotate: [100, 95, 100, 95, 100], // oscillate around -45°
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* 📱 Image in front */}
          <Box
            border="10px solid #e6cbb0"
            borderRadius="4xl"
            rounded={50}
            overflow="hidden"
            boxShadow="xl"
            maxW="300px"
            maxH="600px"
            aspectRatio={9 / 16}
            zIndex={1}
          >
            <Image
              src="/phonepic2.png"
              alt="Phone Preview"
              objectFit="cover"
              w="100%"
              h="100%"
            />
          </Box>
        </MotionBox>
      </MotionFlex>
    </Box>
  );
};

export default HomePage;
