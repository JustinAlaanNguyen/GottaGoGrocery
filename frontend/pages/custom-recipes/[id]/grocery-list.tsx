"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "../../../components/Navbar";
import {
  Box,
  Heading,
  VStack,
  Checkbox,
  Flex,
  Spinner,
  Text,
  IconButton,
  Input,
  HStack,
  Divider,
  Button,
  Badge,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { CloseIcon, AddIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";

type Ingredient = {
  id: number;
  ingredient: string;
  quantity?: string;
  unit?: string;
};

type IngredientState = Ingredient & {
  checked: boolean;
  crossed: boolean;
  note: string;
  isCustom?: boolean;
};

export default function GroceryListPage() {
  const router = useRouter();
  const { id } = router.query;
  const [recipeTitle, setRecipeTitle] = useState("");
  const [ingredients, setIngredients] = useState<IngredientState[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const toast = useToast();
  const [sendingEmail, setSendingEmail] = useState(false);

  async function handleEmailClick() {
    if (neededIngredients.length === 0) {
      toast({ status: "info", title: "No items to email" });
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast({ status: "warning", title: "Please sign in to email the list." });
      return;
    }
    const user = JSON.parse(storedUser);

    setSendingEmail(true);
    try {
      const payload = {
        userId: user.id,
        recipeId: id,
        recipeTitle,
        items: neededIngredients.map((i) => ({
          ingredient: i.ingredient,
          quantity: i.quantity || "",
          unit: i.unit || "",
          note: i.note || "",
          isCustom: !!i.isCustom,
        })),
      };

      const res = await axios.post("/api/grocery-list/email", payload);
      if (res.data?.ok) {
        toast({ status: "success", title: "Grocery list emailed to you!" });
      } else {
        toast({
          status: "error",
          title: res.data?.error || "Failed to send email",
        });
      }
    } catch (err) {
      console.error(err);
      toast({ status: "error", title: "Failed to send email. Try again." });
    } finally {
      setSendingEmail(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    const fetchList = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/custom-recipes/${id}`
        );

        setRecipeTitle(res.data.title);
        setIngredients(
          res.data.ingredients.map((ing: Ingredient) => ({
            ...ing,
            checked: false,
            crossed: false,
            note: "",
            isCustom: false,
          }))
        );
      } catch (err) {
        console.error("Error fetching grocery list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [id]);

  const toggleCheck = (id: number) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, checked: !ing.checked } : ing
      )
    );
  };

  const toggleCross = (id: number) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, crossed: !ing.crossed } : ing
      )
    );
  };

  const updateNote = (id: number, value: string) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, note: value } : ing))
    );
  };

  const addCustomItem = () => {
    if (!newItem.trim()) return;
    const customIngredient: IngredientState = {
      id: Date.now(),
      ingredient: newItem.trim(),
      checked: false,
      crossed: false,
      note: "",
      isCustom: true,
    };
    setIngredients((prev) => [...prev, customIngredient]);
    setNewItem("");
  };

  const neededIngredients = ingredients.filter(
    (ing) => !ing.checked && !ing.crossed
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#fefae0">
        <Spinner size="xl" color="#d4a373" />
      </Flex>
    );
  }

  return (
    <Box bg="#ccd5ae" minH="100vh">
      <Navbar />
      <Flex justify="center" px={4} py={10}>
        <Box
          bg="white"
          borderRadius="2xl"
          p={10}
          w="100%"
          maxW="750px"
          boxShadow="xl"
        >
          {/* Title */}
          <Heading
            as="h1"
            fontSize="3xl"
            mb={2}
            textAlign="center"
            color="#344e41"
          >
            🛒 Grocery Checklist
          </Heading>
          <Text fontSize="lg" textAlign="center" mb={8} color="gray.600">
            For: <b>{recipeTitle}</b>
          </Text>

          {/* Add Custom Item */}
          <Card bg="#fefae0" borderRadius="xl" mb={8}>
            <CardBody>
              <HStack>
                <Input
                  placeholder="Add custom item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  bg="gray.50"
                />
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={addCustomItem}
                >
                  Add
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Ingredient List */}
          <Heading as="h2" fontSize="xl" mb={4} color="#344e41">
            📝 Ingredients
          </Heading>
          <VStack
            align="stretch"
            spacing={4}
            maxH="400px"
            overflowY="auto"
            pr={2}
            mb={10}
          >
            {ingredients.map((ing) => (
              <Card
                key={ing.id}
                borderRadius="lg"
                bg={
                  ing.crossed
                    ? "gray.100"
                    : ing.isCustom
                    ? "yellow.50"
                    : "gray.50"
                }
                boxShadow="sm"
              >
                <CardBody py={3}>
                  <HStack justify="space-between" align="start">
                    <Checkbox
                      colorScheme="green"
                      size="lg"
                      isChecked={ing.checked}
                      onChange={() => toggleCheck(ing.id)}
                    >
                      <Text
                        as={ing.crossed ? "s" : "span"}
                        fontWeight="medium"
                        color={ing.crossed ? "gray.500" : "black"}
                      >
                        {ing.quantity ? `${ing.quantity} ` : ""}
                        {ing.unit ? `${ing.unit} ` : ""}
                        {ing.ingredient}
                      </Text>
                      {ing.isCustom && (
                        <Badge ml={2} colorScheme="yellow">
                          custom
                        </Badge>
                      )}
                    </Checkbox>

                    <IconButton
                      aria-label="Remove ingredient"
                      icon={<CloseIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => toggleCross(ing.id)}
                    />
                  </HStack>

                  {/* Note field */}
                  <Input
                    mt={2}
                    placeholder="Add note (e.g. have half at home)"
                    size="sm"
                    value={ing.note}
                    onChange={(e) => updateNote(ing.id, e.target.value)}
                    bg="white"
                    disabled={ing.crossed}
                  />
                </CardBody>
              </Card>
            ))}
          </VStack>

          <Divider mb={8} />

          {/* Needed Preview */}
          <Heading as="h2" fontSize="xl" mb={4} color="#344e41">
            ✅ Still Needed
          </Heading>
          <Card bg="#fefae0" borderRadius="xl">
            <CardBody>
              {neededIngredients.length > 0 ? (
                <VStack align="start" spacing={2}>
                  {neededIngredients.map((ing) => (
                    <Text key={ing.id}>
                      • {ing.quantity ? `${ing.quantity} ` : ""}
                      {ing.unit ? `${ing.unit} ` : ""}
                      {ing.ingredient}
                      {ing.isCustom && (
                        <Text as="span" color="yellow.600">
                          {" "}
                          [custom]
                        </Text>
                      )}
                      {ing.note && (
                        <Text as="span" color="orange.600" fontStyle="italic">
                          {" "}
                          ({ing.note})
                        </Text>
                      )}
                    </Text>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500">🎉 All ingredients accounted for!</Text>
              )}
            </CardBody>

            <Button
              size="md"
              bg="#344e41"
              color="white"
              _hover={{ bg: "#ccd5ae", color: "black" }}
              isLoading={sendingEmail}
              onClick={handleEmailClick}
            >
              📧 Email me this grocery list
            </Button>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
}
