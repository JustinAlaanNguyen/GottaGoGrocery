"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import NextLink from "next/link";

const MotionFlex = motion(Flex);
const MotionButton = motion(Button);
const MotionBox = motion(Box);

function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/"; // Redirect to homepage
}

const Navbar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const links = [
    { name: "Home", href: "/home" },
    { name: "Features", href: "/features" },
    { name: "Saved Recipes", href: "/recipes/saved" },
    { name: "Search for a recipe", href: "/search-recipe" },
  ];

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    setMounted(true); // Mark component as mounted (client-only)
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Avoid rendering until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Box
      bg={isScrolled ? "white" : "transparent"}
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow={isScrolled ? "md" : "none"}
      transition="background 0.3s, box-shadow 0.3s"
    >
      <MotionFlex
        alignItems="center"
        justifyContent="space-between"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <Link
          as={NextLink}
          href="/"
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="black"
          _hover={{ opacity: 0.7 }}
        >
          GottaGoGrocery
        </Link>

        {/* Desktop Links */}
        <HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }}>
          {links.map((link) => (
            <Link
              key={link.name}
              as={NextLink}
              href={link.href}
              fontSize="lg"
              fontWeight="medium"
              color="black"
              _hover={{ textDecoration: "none", opacity: 0.7 }}
            >
              {link.name}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Button
                onClick={handleLogout}
                colorScheme="red"
                variant="outline"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <MotionButton
              as={NextLink}
              href="/account/signin"
              bg="#3c5b3a"
              color="white"
              fontSize="lg"
              px={6}
              py={4}
              borderRadius="full"
              _hover={{ bg: "#2d452c" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              position="relative"
              overflow="hidden"
            >
              <MotionBox
                position="absolute"
                top={0}
                left={0}
                w="150%"
                h="100%"
                bgGradient="linear(to-r, transparent, rgba(255,255,255,0.2), transparent)"
                transform="rotate(15deg)"
                filter="blur(6px)"
                pointerEvents="none"
                animate={{ x: ["-150%", "150%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              Sign In
            </MotionButton>
          )}
        </HStack>

        {/* Hamburger for Mobile */}
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
          variant="ghost"
          fontSize="2xl"
        />
      </MotionFlex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="white">
          <DrawerCloseButton mt={2} />
          <DrawerBody mt={10}>
            <VStack spacing={6} align="flex-start">
              {links.map((link) => (
                <Link
                  key={link.name}
                  as={NextLink}
                  href={link.href}
                  fontSize="xl"
                  fontWeight="medium"
                  color="black"
                  onClick={onClose}
                >
                  {link.name}
                </Link>
              ))}
              {loggedIn ? (
                <Button
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                  colorScheme="red"
                  w="full"
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  as={NextLink}
                  href="/account/signin"
                  bg="#3c5b3a"
                  color="white"
                  fontSize="xl"
                  px={6}
                  py={4}
                  borderRadius="full"
                  _hover={{ bg: "#2d452c" }}
                  w="full"
                  onClick={onClose}
                >
                  Sign In
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
