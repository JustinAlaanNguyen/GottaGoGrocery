import React from "react";
import { Box, Flex, HStack, Link, Text, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionFlex = motion(Flex);

const Navbar: React.FC = () => {
  const links = ["Home", "Features", "Recipes", "Search for a recipe"];

  return (
    <Box
      bg="transparent"
      px={16} // doubled
      py={8} // doubled
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <MotionFlex
        alignItems="center"
        justifyContent="space-between"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <Text
          fontSize="3xl" // doubled
          fontWeight="bold"
          cursor="pointer"
          color="black"
          _hover={{ opacity: 0.7 }}
        >
          GottaGoGrocery
        </Text>

        {/* Links */}
        <HStack as="nav" spacing={12}>
          {" "}
          {/* doubled spacing */}
          {links.map((link) => (
            <Link
              key={link}
              fontSize="2xl" // doubled
              fontWeight="medium"
              color="black"
              _hover={{ textDecoration: "none", opacity: 0.7 }}
            >
              {link}
            </Link>
          ))}
          {/* Signup button */}
          <Button
            bg="#3c5b3a"
            color="white"
            fontSize="2xl"
            px={8}
            py={6}
            borderRadius="full"
            _hover={{ bg: "#2d452c" }}
          >
            Signup
          </Button>
        </HStack>
      </MotionFlex>
    </Box>
  );
};

export default Navbar;
