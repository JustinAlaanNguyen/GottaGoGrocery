"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
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
  window.location.href = "/";
}

// Include an icon (emoji for now) on each link
const links = [
  { name: "Home", href: "/home", icon: "🏠" },
  { name: "Features", href: "/features", icon: "✨" },
  { name: "Create Recipe", href: "/custom-recipes", icon: "➕" },
  { name: "Saved Recipes", href: "/recipes/saved-recipes", icon: "📚" },
  { name: "Search Recipe", href: "/search-recipe", icon: "🔍" },
];

const Navbar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <Box
      bg={isScrolled ? "white" : "transparent"}
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow={isScrolled ? "md" : "none"}
      transition="0.3s"
    >
      <MotionFlex
        align="center"
        justify="space-between"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <ChakraLink
          as={NextLink}
          href="/"
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="black"
          _hover={{ opacity: 0.7 }}
        >
          GottaGoGrocery
        </ChakraLink>

        {/* Desktop Buttons */}
        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          {links.map((link) => (
            <MotionButton
              key={link.name}
              as={NextLink}
              href={link.href}
              leftIcon={<span style={{ fontSize: "1.1rem" }}>{link.icon}</span>}
              bg="white"
              border="1px solid #cead7fff"
              color="#2d452c"
              _hover={{ bg: "#faeddb", textDecoration: "none" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {link.name}
            </MotionButton>
          ))}

          {loggedIn ? (
            <Button onClick={handleLogout} colorScheme="red" variant="outline">
              Sign Out
            </Button>
          ) : (
            <MotionButton
              as={NextLink}
              href="/account/signin"
              bg="#3c5b3a"
              color="white"
              px={6}
              py={4}
              borderRadius="full"
              _hover={{ bg: "#2d452c" }}
              whileHover={{ scale: 1.05 }}
            >
              Sign In
            </MotionButton>
          )}
        </HStack>

        {/* Hamburger icon for mobile */}
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
          variant="ghost"
        />
      </MotionFlex>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="white">
          <DrawerCloseButton mt={2} />
          <DrawerBody mt={12}>
            <VStack spacing={6} align="stretch">
              {links.map((link) => (
                <Button
                  key={link.name}
                  as={NextLink}
                  href={link.href}
                  leftIcon={<span>{link.icon}</span>}
                  justifyContent="flex-start"
                  onClick={onClose}
                  variant="ghost"
                  fontSize="xl"
                >
                  {link.name}
                </Button>
              ))}

              {loggedIn ? (
                <Button
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                  colorScheme="red"
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  as={NextLink}
                  href="/account/signin"
                  bg="#3c5b3a"
                  color="white"
                  _hover={{ bg: "#2d452c" }}
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
