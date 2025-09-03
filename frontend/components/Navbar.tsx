"use client";
import Image from "next/image";
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
  Circle,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import NextLink from "next/link";

const MotionFlex = motion(Flex);
const MotionButton = motion(Button);

function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
}

// Navigation links
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
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
    if (isLoggedIn()) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUsername(parsedUser.name || null);
        } catch {
          setUsername(null);
        }
      }
    }
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
      px={{ base: 4, md: 6, lg: 10 }}
      py={{ base: 3, md: 4 }}
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
          _hover={{ opacity: 0.8 }}
          display="flex"
          alignItems="center"
        >
          <Image
            src="/gggLogo.png"
            alt="GottaGoGrocery Logo"
            width={160} // adjust as needed
            height={50} // adjust as needed
            style={{ height: "auto", width: "auto", maxHeight: "170px" }}
          />
        </ChakraLink>

        {/* Desktop Nav */}
        <HStack
          spacing={{ base: 2, md: 4, lg: 6 }}
          display={{ base: "none", md: "flex" }}
          align="center"
          flexWrap="wrap"
        >
          {links.map((link) => (
            <MotionButton
              key={link.name}
              as={NextLink}
              href={link.href}
              leftIcon={<span style={{ fontSize: "1.2rem" }}>{link.icon}</span>}
              bg="white"
              border="1px solid #cead7fff"
              color="#2d452c"
              _hover={{ bg: "#faeddb", textDecoration: "none" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              px={{ base: 2, md: 4 }}
              py={{ base: 1, md: 2 }}
              fontWeight="700"
            >
              {link.name}
            </MotionButton>
          ))}

          {loggedIn ? (
            <>
              <Button
                onClick={handleLogout}
                colorScheme="red"
                variant="outline"
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                px={{ base: 2, md: 4 }}
                fontWeight="700"
              >
                Sign Out
              </Button>

              {username && (
                <Circle
                  as={NextLink}
                  href="/account/profile"
                  size={{ base: "40px", md: "45px", lg: "50px" }}
                  bg="#3c5b3a"
                  color="white"
                  fontWeight="bold"
                  fontSize={{ base: "md", md: "lg", lg: "xl" }}
                  _hover={{ bg: "#2d452c" }}
                >
                  {username.charAt(0).toUpperCase()}
                </Circle>
              )}
            </>
          ) : (
            <MotionButton
              as={NextLink}
              href="/account/signin"
              bg="#3c5b3a"
              color="white"
              px={{ base: 3, md: 5 }}
              py={{ base: 2, md: 3 }}
              borderRadius="full"
              _hover={{ bg: "#2d452c" }}
              whileHover={{ scale: 1.05 }}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
            >
              Sign In
            </MotionButton>
          )}
        </HStack>

        {/* Mobile Hamburger */}
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon boxSize={6} />}
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
          variant="ghost"
        />
      </MotionFlex>

      {/* Mobile Drawer */}
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
                  fontSize="lg"
                  py={6}
                >
                  {link.name}
                </Button>
              ))}

              {loggedIn ? (
                <>
                  <Button
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    colorScheme="red"
                    fontSize="lg"
                  >
                    Sign Out
                  </Button>

                  {username && (
                    <Circle
                      as={NextLink}
                      href="/account/profile"
                      size="55px"
                      bg="#3c5b3a"
                      color="white"
                      fontWeight="bold"
                      fontSize="xl"
                      _hover={{ bg: "#2d452c" }}
                    >
                      {username.charAt(0).toUpperCase()}
                    </Circle>
                  )}
                </>
              ) : (
                <Button
                  as={NextLink}
                  href="/account/signin"
                  bg="#3c5b3a"
                  color="white"
                  _hover={{ bg: "#2d452c" }}
                  onClick={onClose}
                  fontSize="lg"
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
