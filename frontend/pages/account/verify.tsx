"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Box, Text, Spinner } from "@chakra-ui/react";

export default function Verify() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (token) {
      axios
        .post("http://localhost:5000/api/auth/verify", { token })
        .then((res) => setMessage(res.data.message))
        .catch((err) =>
          setMessage(err.response?.data?.message || "Verification failed.")
        );
    }
  }, [token]);

  return (
    <Box textAlign="center" mt="10">
      {!token ? (
        <Text>Invalid verification link.</Text>
      ) : (
        <Text>{message}</Text>
      )}
    </Box>
  );
}
