// SignIn.tsx
import * as React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "../../components/Navbar";
import NextLink from "next/link";
import { useRouter } from "next/router";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const floatingAnimation = {
  y: [0, -10, 0, 10, 0],
  scale: [1, 1.05, 1, 1.08, 1],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const fruitEmojis = ["🍎", "🍓", "🍍"];

const SignIn = (): React.ReactElement => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [fruits, setFruits] = React.useState<React.ReactElement[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const elements = [...Array(30)].map((_, i) => {
      const top = `${Math.random() * 90}%`;
      const left = `${Math.random() * 90}%`;
      const duration = Math.random() * 4 + 3;
      const rotation = Math.random() * 360;
      const fruit = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];

      return (
        <MotionBox
          key={i}
          position="absolute"
          top={top}
          left={left}
          fontSize="22px"
          zIndex={0}
          style={{ transform: `rotate(${rotation}deg)` }}
          animate={{
            y: [0, 15, 0, 15, 0],
            rotate: [
              rotation,
              rotation + 20,
              rotation,
              rotation - 20,
              rotation,
            ],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        >
          {fruit}
        </MotionBox>
      );
    });
    setFruits(elements);
  }, []);

  const handleSubmit = async () => {
    setShake(false);
    setMessage("");

    if (!email || !password) {
      setShake(true);
      setMessage("Please fill in both fields.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signin", {
        email,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Login successful!");
      router.push("/home");
    } catch (err: any) {
      setMessage(
        err.response?.data?.error || "Login failed. Check your credentials."
      );
      setShake(true);
    }
  };

  return (
    <Box bg="#ccd5ae" minH="100vh" position="relative" overflow="hidden">
      <Navbar />

      {/* Floating background blobs */}
      <MotionBox
        position="absolute"
        w="350px"
        h="350px"
        borderRadius="full"
        bg="#faeddb"
        top="20%"
        left="10%"
        zIndex={0}
        animate={floatingAnimation}
      />
      <MotionBox
        position="absolute"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="#cead7f"
        top="70%"
        left="80%"
        zIndex={0}
        animate={floatingAnimation}
      />

      {/* Floating fruits */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {fruits}
      </Box>

      {/* Sign-in card */}
      <MotionFlex
        align="center"
        justify="center"
        minH="calc(100vh - 80px)"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        zIndex={1}
      >
        <MotionBox
          position="relative"
          bg="whiteAlpha.800"
          backdropFilter="blur(10px)"
          p={{ base: 3, sm: 4, md: 6 }} // less padding
          borderRadius="2xl" // smaller radius if you want
          boxShadow="xl" // softer shadow
          maxW={{ base: "70%", sm: "xs", md: "sm" }} // narrower widths
          w="full"
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* 🌿 Leaf accents */}
          <MotionBox
            position="absolute"
            width="90px"
            height="30px"
            bg="#2d452c"
            borderRadius="50%"
            top="45px"
            left="-70px"
            style={{ transform: "rotate(-45deg)" }}
            zIndex={0}
            animate={{ rotate: [70, 62, 70, 62, 70] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <MotionBox
            position="absolute"
            width="60px"
            height="1px"
            borderRadius="full"
            top="90px"
            left="-40px"
            zIndex={0}
            bgGradient="linear(to-r, #dbd8d8 60%, black 40%)"
            animate={{ rotate: [69, 65, 69, 65, 69] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <MotionBox
            position="absolute"
            width="90px"
            height="30px"
            bg="#2d452c"
            borderRadius="50%"
            bottom="115px"
            right="-90px"
            style={{ transform: "rotate(135deg)" }}
            zIndex={0}
            animate={{ rotate: [135, 125, 135, 125, 135] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <MotionBox
            position="absolute"
            width="60px"
            height="1px"
            borderRadius="full"
            bottom="100px"
            right="-50px"
            bgGradient="linear(to-r, #dbd8d8 60%, black 40%)"
            animate={{ rotate: [135, 127, 135, 127, 135] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 📋 Form content */}
          <Heading
            as="h2"
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
            textAlign="center"
            mb={8}
          >
            Sign In
          </Heading>

          <VStack spacing={6}>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size={{ base: "md", md: "lg" }}
              fontSize={{ base: "lg", md: "2xl" }}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size={{ base: "md", md: "lg" }}
              fontSize={{ base: "lg", md: "2xl" }}
            />

            <MotionBox
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              w="full"
            >
              <Button
                bg="#3c5b3a"
                color="white"
                fontSize={{ base: "lg", md: "2xl" }}
                py={{ base: 6, md: 8 }}
                w="full"
                borderRadius="full"
                _hover={{ bg: "#2d452c" }}
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Signing in"
                isDisabled={isSubmitting}
              >
                Sign In
              </Button>
            </MotionBox>

            {message && (
              <Text
                color={message.includes("successful") ? "green.500" : "red.500"}
                fontSize="lg"
                textAlign="center"
              >
                {message}
              </Text>
            )}

            <Text mt={6} fontSize="lg" color="gray.700" textAlign="center">
              Don’t have an account?{" "}
              <ChakraLink
                as={NextLink}
                href="/account/signup"
                color="#3c5b3a"
                fontWeight="bold"
                _hover={{ textDecoration: "underline" }}
              >
                Sign Up
              </ChakraLink>
            </Text>
          </VStack>
        </MotionBox>
      </MotionFlex>
    </Box>
  );
};

export default SignIn;
