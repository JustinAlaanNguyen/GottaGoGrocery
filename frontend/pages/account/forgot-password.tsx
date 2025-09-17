"use client";

import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading } from "@chakra-ui/react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/request-password-reset`,
        { email }
      );
      setMessage(res.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="#ccd5ae"
    >
      <VStack
        spacing={6}
        bg="whiteAlpha.900"
        p={8}
        borderRadius="xl"
        boxShadow="lg"
      >
        <Heading>Forgot Password</Heading>
        <Input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button bg="#3c5b3a" color="white" onClick={handleSubmit}>
          Send Reset Link
        </Button>
        {message && <Text>{message}</Text>}
      </VStack>
    </Box>
  );
}
