"use client";

import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import axios from "axios";

export default function CreateCustomRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [serving, setServing] = useState("");
  const [ingredients, setIngredients] = useState([
    { ingredient: "", quantity: "" },
  ]);
  const [steps, setSteps] = useState([""]);
  const [notes, setNotes] = useState("");

  const handleAddIngredient = () =>
    setIngredients([...ingredients, { ingredient: "", quantity: "" }]);
  const handleAddStep = () => setSteps([...steps, ""]);

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      router.push("/account/signin");
      return;
    }

    await axios.post("http://localhost:5000/api/custom-recipes", {
      userId: user.id,
      title,
      recipeDescription,
      serving,
      ingredients,
      steps,
      notes,
    });

    router.push("/home");
  };

  return (
    <Box bg="#fbfaf8" minH="100vh">
      <Navbar />
      <Box
        maxW="3xl"
        mx="auto"
        py={10}
        px={6}
        bg="white"
        rounded="xl"
        shadow="lg"
      >
        <Heading mb={6} color="#2d452c">
          Create Your Recipe
        </Heading>
        <VStack spacing={4}>
          <Input
            placeholder="Recipe Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Short Description"
            value={recipeDescription}
            onChange={(e) => setRecipeDescription(e.target.value)}
          />
          <Input
            placeholder="Servings"
            value={serving}
            onChange={(e) => setServing(e.target.value)}
          />

          <Heading size="md" mt={4}>
            Ingredients
          </Heading>
          {ingredients.map((ing, i) => (
            <SimpleGrid columns={2} spacing={3} key={i}>
              <Input
                placeholder="Ingredient"
                value={ing.ingredient}
                onChange={(e) => {
                  const updated = [...ingredients];
                  updated[i].ingredient = e.target.value;
                  setIngredients(updated);
                }}
              />
              <Input
                placeholder="Quantity"
                value={ing.quantity}
                onChange={(e) => {
                  const updated = [...ingredients];
                  updated[i].quantity = e.target.value;
                  setIngredients(updated);
                }}
              />
            </SimpleGrid>
          ))}
          <Button size="sm" onClick={handleAddIngredient} colorScheme="green">
            + Add Ingredient
          </Button>

          <Heading size="md" mt={4}>
            Steps
          </Heading>
          {steps.map((st, i) => (
            <Textarea
              key={i}
              placeholder={`Step ${i + 1}`}
              value={st}
              onChange={(e) => {
                const updated = [...steps];
                updated[i] = e.target.value;
                setSteps(updated);
              }}
            />
          ))}
          <Button size="sm" onClick={handleAddStep} colorScheme="green">
            + Add Step
          </Button>

          <Textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button colorScheme="teal" size="lg" onClick={handleSubmit}>
            Save Recipe
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
