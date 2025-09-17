"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, Input, Text, VStack, Heading } from "@chakra-ui/react";
import axios from "axios";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`,
        { token, password }
      );
      setMessage(res.data.message);
      setTimeout(() => router.push("/account/signin"), 2000);
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
        <Heading>Reset Password</Heading>
        <Input
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button bg="#3c5b3a" color="white" onClick={handleSubmit}>
          Reset Password
        </Button>
        {message && <Text>{message}</Text>}
      </VStack>
    </Box>
  );
}
