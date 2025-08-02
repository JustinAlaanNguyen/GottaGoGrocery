import React, { useState, useMemo } from "react";
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
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import NextLink from "next/link";

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

const lightSweep = {
  x: ["-150%", "150%"],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
    delay: 1,
  },
};

const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);

  const router = useRouter();

  const sparkles = useMemo(() => {
    return [...Array(25)].map((_, i) => {
      const top = `${Math.random() * 80 + 5}%`;
      const left = `${Math.random() * 90 + 5}%`;
      const duration = Math.random() * 4 + 3;

      return (
        <MotionBox
          key={i}
          position="absolute"
          w="8px"
          h="8px"
          bgGradient="linear(to-br, #ffe9a7, #FFB823)"
          borderRadius="full"
          top={top}
          left={left}
          zIndex={0}
          opacity={0.8}
          boxShadow="0 0 8px #ffd700"
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [0, -10, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      );
    });
  }, []);

  const handleLogin = async () => {
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
    <Box bg="#fbfaf8" minH="100vh" position="relative" overflow="hidden">
      <Navbar />

      {/* Floating background circles */}
      <MotionBox
        position="absolute"
        w="350px"
        h="350px"
        borderRadius="full"
        bg="#faeddb"
        top="70%"
        left="10%"
        zIndex={0}
        animate={floatingAnimation}
      />
      <MotionBox
        position="absolute"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="#cead7fff"
        top="20%"
        left="80%"
        zIndex={0}
        animate={floatingAnimation}
      />

      {/* Leaf 1*/}
      <MotionBox
        position="absolute"
        width="90px"
        height="30px"
        bg="#2d452c"
        borderRadius="50%"
        top="46.5%"
        left="31.5%"
        style={{
          transformOrigin: "right center",
          transform: "translate(-10px, -50%) rotate(-45deg)",
        }}
        zIndex={0}
        animate={{ rotate: [70, 62, 70, 62, 70] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Branch 1*/}
      <MotionBox
        position="absolute"
        width="60px"
        height="1px"
        borderRadius="full"
        top="50%"
        left="33.5%"
        style={{
          transformOrigin: "right center",
          transform: "translate(-50%, -50%) rotate(-45deg)",
        }}
        zIndex={0}
        bgGradient="linear(to-r, #dbd8d8ff 60%, black 40%)"
        animate={{ rotate: [69, 65, 69, 65, 69] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Leaf 2*/}
      <MotionBox
        position="absolute"
        width="90px"
        height="30px"
        bg="#2d452c"
        borderRadius="50%"
        top="62%"
        left="59.3%"
        style={{
          transformOrigin: "right center",
          transform: "translate(-10px, -50%) rotate(-45deg)",
        }}
        zIndex={0}
        animate={{ rotate: [135, 125, 135, 125, 135] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Branch 2*/}
      <MotionBox
        position="absolute"
        width="60px"
        height="1px"
        borderRadius="full"
        top="65%"
        left="60.2%"
        style={{
          transformOrigin: "right center",
          transform: "translate(-50%, -50%) rotate(-45deg)",
        }}
        zIndex={0}
        bgGradient="linear(to-r, #9c9a9aff 60%, black 40%)"
        animate={{ rotate: [135, 127, 135, 127, 135] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {sparkles}

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
          p={16}
          borderRadius="3xl"
          boxShadow="2xl"
          maxW="lg"
          w="full"
          overflow="hidden"
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* 🪞 Reflection Shine */}
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            h="100%"
            w="150%"
            bgGradient="linear(to-r, transparent, rgba(255,255,255,0.2), transparent)"
            filter="blur(8px)"
            transform="rotate(15deg)"
            pointerEvents="none"
            animate={lightSweep}
            zIndex={2}
          />
          <Heading as="h2" fontSize="5xl" textAlign="center" mb={10}>
            Welcome Back
          </Heading>

          <VStack spacing={6}>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="lg"
              fontSize="2xl"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
              fontSize="2xl"
            />
            <MotionBox
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              w="full"
            >
              <Button
                bg="#3c5b3a"
                color="white"
                fontSize="2xl"
                py={8}
                w="full"
                borderRadius="full"
                _hover={{ bg: "#2d452c" }}
                onClick={handleLogin}
              >
                Sign In
              </Button>
            </MotionBox>

            {message && (
              <Text
                color={
                  message.toLowerCase().includes("success")
                    ? "green.500"
                    : "red.500"
                }
                fontSize="lg"
                textAlign="center"
              >
                {message}
              </Text>
            )}
          </VStack>

          <Text mt={6} fontSize="lg" color="gray.700" textAlign="center">
            Don’t have an account?{" "}
            <NextLink href="/account/signup" passHref legacyBehavior>
              <ChakraLink
                color="#3c5b3a"
                fontWeight="bold"
                _hover={{ textDecoration: "underline" }}
                cursor="pointer"
              >
                Sign Up
              </ChakraLink>
            </NextLink>
          </Text>
        </MotionBox>
      </MotionFlex>
    </Box>
  );
};

export default Signin;
