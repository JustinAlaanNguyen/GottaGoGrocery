"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Box, Text, Spinner } from "@chakra-ui/react";

export default function Verify() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (token) {
      axios
        .post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify`, {
          token,
        })
        .then((res) => {
          setMessage(res.data.message);

          // ✅ Redirect if verification succeeded
          if (res.data.success) {
            setTimeout(() => {
              window.location.href =
                "https://www.gottagogrocery.com/account/signin";
              // Or: router.push("/account/signin") if you want client-side routing
            }, 1500); // small delay so user sees the success message
          }
        })
        .catch((err) =>
          setMessage(err.response?.data?.message || "Verification failed.")
        );
    }
  }, [token, router]);

  return (
    <Box textAlign="center" mt="10">
      {!token ? (
        <Text>Invalid verification link.</Text>
      ) : message === "Verifying..." ? (
        <Spinner size="lg" />
      ) : (
        <Text>{message}</Text>
      )}
    </Box>
  );
}
