"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Spinner,
  useToast,
  Flex,
  Divider,
  FormErrorMessage,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "../../components/Navbar";

const MotionBox = motion(Box);

const floatingEmojiAnimation = {
  y: [0, 20, 0],
  opacity: [0.6, 1, 0.6],
  transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }, // slower & smoother
};

const profileEmojis = ["👤", "📱", "✉️", "💻", "🔒"];

export default function ProfilePage() {
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const toast = useToast();

  // Load profile
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsed = JSON.parse(storedUser);

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/profile/${parsed.id}`
      )
      .then((res) => {
        setProfile(res.data);
        setFormData({
          username: res.data.username,
          email: res.data.email,
          phone: res.data.phone || "",
          password: "",
        });
      })
      .catch(() => toast({ title: "Error loading profile", status: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  // Input validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone =
        "Phone must be 7–15 digits (optionally starting with +)";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ title: "Please fix the errors", status: "warning" });
      return;
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/profile/${profile.id}`,
        formData
      );
      toast({ title: "Profile updated!", status: "success" });
      setProfile({ ...profile, ...formData });
      setEditing(false);
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text>Profile not found</Text>
      </Box>
    );
  }

  // Floating icons
  const floatingIcons = [...Array(20)].map((_, i) => {
    const top = `${Math.random() * 90}%`;
    const left = `${Math.random() * 90}%`;
    const icon =
      profileEmojis[Math.floor(Math.random() * profileEmojis.length)];
    return (
      <MotionBox
        key={i}
        position="absolute"
        top={top}
        left={left}
        fontSize="22px"
        zIndex={0}
        animate={floatingEmojiAnimation}
      >
        {icon}
      </MotionBox>
    );
  });

  return (
    <Box bg="#ccd5ae" minH="100vh">
      <Navbar />

      {/* Floating Background */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {floatingIcons}
      </Box>

      <Flex
        maxW="700px"
        mx="auto"
        py={16}
        px={6}
        position="relative"
        zIndex={1}
      >
        <MotionBox
          flex="1"
          bg="white"
          rounded="2xl"
          shadow="lg"
          p={10}
          border="1px solid #e9edc9"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Heading mb={6} color="#344e41" textAlign="center">
            My Profile
          </Heading>

          <AnimatePresence mode="wait">
            {!editing ? (
              <MotionBox
                key="view"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <VStack spacing={5} align="stretch">
                  <Box p={4} rounded="lg" bg="#faedcd">
                    <Text fontWeight="bold" color="#344e41">
                      Username
                    </Text>
                    <Text>{profile.username}</Text>
                  </Box>
                  <Box p={4} rounded="lg" bg="#faedcd">
                    <Text fontWeight="bold" color="#344e41">
                      Email
                    </Text>
                    <Text>{profile.email}</Text>
                  </Box>
                  <Box p={4} rounded="lg" bg="#faedcd">
                    <Text fontWeight="bold" color="#344e41">
                      Phone
                    </Text>
                    <Text>{profile.phone || "Not set"}</Text>
                  </Box>
                  <Box p={4} rounded="lg" bg="#faedcd">
                    <Text fontWeight="bold" color="#344e41">
                      Joined
                    </Text>
                    <Text>{new Date(profile.created_at).toDateString()}</Text>
                  </Box>

                  <Button
                    mt={6}
                    bg="#d4a373"
                    color="white"
                    _hover={{ bg: "#344e41" }}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </VStack>
              </MotionBox>
            ) : (
              <MotionBox
                key="edit"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.username}>
                    <FormLabel>Username</FormLabel>
                    <Input
                      bg="#faedcd"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                    {errors.username && (
                      <FormErrorMessage>{errors.username}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      bg="#faedcd"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    {errors.email && (
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.phone}>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      placeholder="+12263431643" // <-- show correct example
                      bg="#faedcd"
                      value={formData.phone}
                      onChange={(e) => {
                        let newPhone = e.target.value.trim();

                        // Auto prepend +1 if missing and looks like a 10-digit Canadian/US number
                        if (/^\d{10}$/.test(newPhone)) {
                          newPhone = `+1${newPhone}`;
                        }

                        setFormData({ ...formData, phone: newPhone });

                        if (newPhone !== profile.phone) {
                          setIsPhoneVerified(false);
                        } else {
                          setIsPhoneVerified(true);
                        }
                      }}
                    />
                    {errors.phone && (
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
                    )}

                    <Button
                      mt={2}
                      size="sm"
                      bg="#d4a373"
                      color="white"
                      _hover={{ bg: "#344e41" }}
                      onClick={async () => {
                        try {
                          await axios.post(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/phone/send`,
                            {
                              phone: formData.phone,
                            }
                          );
                          setVerificationSent(true);
                          toast({
                            title: "Verification code sent!",
                            status: "info",
                          });
                        } catch {
                          toast({
                            title: "Failed to send verification code",
                            status: "error",
                          });
                        }
                      }}
                    >
                      Send Verification Code
                    </Button>
                  </FormControl>

                  {verificationSent && (
                    <FormControl mt={4}>
                      <FormLabel>Enter Verification Code</FormLabel>
                      <Input
                        placeholder="123456"
                        bg="#faedcd"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                      <Button
                        mt={2}
                        size="sm"
                        bg="#344e41"
                        color="white"
                        _hover={{ bg: "#ccd5ae", color: "black" }}
                        onClick={async () => {
                          try {
                            await axios.post(
                              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/phone/confirm`,
                              {
                                phone: formData.phone,
                                code: verificationCode,
                                userId: profile.id,
                              }
                            );
                            toast({
                              title: "Phone verified!",
                              status: "success",
                            });
                            setIsPhoneVerified(true);
                            setVerificationSent(false);
                          } catch {
                            toast({ title: "Invalid code", status: "error" });
                          }
                        }}
                      >
                        Verify Code
                      </Button>
                    </FormControl>
                  )}

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      bg="#faedcd"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    {errors.password && (
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    )}
                  </FormControl>

                  <Divider borderColor="#e9edc9" />

                  <Button
                    w="full"
                    bg="#344e41"
                    color="white"
                    _hover={{ bg: "#ccd5ae", color: "black" }}
                    onClick={handleSave}
                    isDisabled={!isPhoneVerified} // <-- disable if not verified
                  >
                    Save Changes
                  </Button>

                  <Button
                    w="full"
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </MotionBox>
      </Flex>
    </Box>
  );
}
