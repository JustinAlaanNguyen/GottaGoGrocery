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
        .post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify`, {
          token,
        })
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

// ALTER TABLE user ADD COLUMN isVerified BOOLEAN DEFAULT false;
// ALTER TABLE user ADD COLUMN verificationToken VARCHAR(255);
// ALTER TABLE user ADD COLUMN verificationExpires DATETIME;
