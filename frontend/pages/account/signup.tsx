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

// Pick a random veggie emoji
const veggieEmojis = ["🥕", "🧅", "🥦"];

const Signup = (): React.ReactElement => {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [veggies, setVeggies] = React.useState<React.ReactElement[]>([]);

  React.useEffect(() => {
    const elements = [...Array(20)].map((_, i) => {
      const top = `${Math.random() * 90}%`;
      const left = `${Math.random() * 90}%`;
      const duration = Math.random() * 4 + 3;
      const rotation = Math.random() * 360;
      const veggie =
        veggieEmojis[Math.floor(Math.random() * veggieEmojis.length)];

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
            y: [0, -15, 0, 15, 0],
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
          {veggie}
        </MotionBox>
      );
    });
    setVeggies(elements);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage("");
    setShake(false);
    setSuccess(false);

    const trimmedEmail = email.trim().replace(/\s+/g, "");
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedUsername || !password || !confirmPassword) {
      setMessage("Please fill out all fields.");
      setShake(true);
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      setShake(true);
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setShake(true);
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setShake(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        email: trimmedEmail,
        username: trimmedUsername,
        password,
      });
      setSuccess(true);
      setMessage(res.data.message || "Signup successful!");
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Signup failed.");
      setShake(true);
    }

    setIsSubmitting(false);
  };

  return (
    <Box bg="#fbfaf8" minH="100vh" position="relative" overflow="hidden">
      <Navbar />

      {/* Floating Background Circles */}
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
        bg="#cead7fff"
        top="70%"
        left="80%"
        zIndex={0}
        animate={floatingAnimation}
      />
      {/* Decorative Leaves and Branches */}
      <MotionBox
        position="absolute"
        width="90px"
        height="30px"
        bg="#2d452c"
        borderRadius="50%"
        top="60.5%"
        left="29%"
        style={{
          transformOrigin: "right center",
          transform: "translate(-10px, -50%) rotate(-45deg)",
        }}
        zIndex={0}
        animate={{ rotate: [70, 62, 70, 62, 70] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <MotionBox
        position="absolute"
        width="60px"
        height="1px"
        borderRadius="full"
        top="65%"
        left="32%"
        style={{
          transformOrigin: "right center",
          transform: "translate(-50%, -50%) rotate(-45deg)",
        }}
        zIndex={0}
        bgGradient="linear(to-r, #dbd8d8ff 60%, black 40%)"
        animate={{ rotate: [69, 65, 69, 65, 69] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <MotionBox
        position="absolute"
        width="90px"
        height="30px"
        bg="#2d452c"
        borderRadius="50%"
        top="45.5%"
        left="57%"
        style={{
          transformOrigin: "right center",
          transform: "translate(-10px, -50%) rotate(-45deg)",
        }}
        zIndex={0}
        animate={{ rotate: [135, 125, 135, 125, 135] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <MotionBox
        position="absolute"
        width="60px"
        height="1px"
        borderRadius="full"
        top="50%"
        left="58%"
        style={{
          transformOrigin: "right center",
          transform: "translate(-50%, -50%) rotate(-45deg)",
        }}
        zIndex={0}
        bgGradient="linear(to-r, #dbd8d8ff 60%, black 40%)"
        animate={{ rotate: [135, 127, 135, 127, 135] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Vegetable Emojis */}
      {veggies}

      <motion.div
        style={{
          transform: "scale(0.75)",
          transformOrigin: "top center",
        }}
      >
        {/* Floating leaves */}
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
            bg="whiteAlpha.800"
            backdropFilter="blur(10px)"
            p={8}
            borderRadius="3xl"
            boxShadow="2xl"
            maxW="md"
            w="full"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Heading as="h2" fontSize="5xl" textAlign="center" mb={10}>
              Create Your Account
            </Heading>

            <VStack spacing={6}>
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                size="lg"
                fontSize="2xl"
              />
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
              <Input
                placeholder="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Signing up"
                  isDisabled={isSubmitting}
                >
                  Sign Up
                </Button>
              </MotionBox>

              {message && (
                <Text
                  color={success ? "green.500" : "red.500"}
                  fontSize="lg"
                  textAlign="center"
                >
                  {message}
                </Text>
              )}

              <Text mt={6} fontSize="lg" color="gray.700" textAlign="center">
                Already have an account?{" "}
                <ChakraLink
                  as={NextLink}
                  href="/account/signin"
                  color="#3c5b3a"
                  fontWeight="bold"
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign In
                </ChakraLink>
              </Text>
            </VStack>
          </MotionBox>
        </MotionFlex>
      </motion.div>
    </Box>
  );
};

export default Signup;
