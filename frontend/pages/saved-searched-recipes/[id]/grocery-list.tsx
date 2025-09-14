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
  isCustom?: boolean;
};

type IngredientState = Ingredient & {
  checked: boolean;
  crossed: boolean;
  note: string;
};

export default function GroceryListPage() {
  const router = useRouter();
  const { id } = router.query;

  const [recipeTitle, setRecipeTitle] = useState("");
  const [ingredients, setIngredients] = useState<IngredientState[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchGroceryList = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/saved-recipes/${id}/grocery-list`
        );
        setRecipeTitle(res.data.recipeTitle);
        setIngredients(
          res.data.ingredients.map((ing: Ingredient) => ({
            ...ing,
            checked: false,
            crossed: false,
            note: "",
          }))
        );
      } catch (err) {
        console.error("Error fetching grocery list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroceryList();
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

      const res = await axios.post(
        "http://localhost:5000/api/grocery-list/email",
        payload
      );

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

  async function handleSmsClick() {
    if (neededIngredients.length === 0) {
      toast({ status: "info", title: "No items to text" });
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast({ status: "warning", title: "Please sign in to text the list." });
      return;
    }
    const user = JSON.parse(storedUser);

    try {
      const payload = {
        userId: user.id,
        recipeId: id,
        recipeTitle,
        items: neededIngredients.map((i) => ({
          ingredient: String(i.ingredient || ""),
          quantity: String(i.quantity || ""),
          unit: String(i.unit || ""),
          note: String(i.note || ""),
          isCustom: !!i.isCustom,
        })),
      };

      const res = await axios.post(
        "http://localhost:5000/api/grocery-list/sms",
        payload
      );

      if (res.data?.ok) {
        toast({ status: "success", title: "Text message sent!" });
      } else {
        toast({
          status: "error",
          title: res.data?.error || "Failed to send text",
        });
      }
    } catch (err) {
      console.error(err);
      toast({ status: "error", title: "Failed to send text. Try again." });
    }
  }

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
          maxW="1100px"
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

          {/* Two-column layout */}
          <Flex
            align="flex-start"
            gap={8}
            direction={{ base: "column", md: "row" }} // ✅ stack on mobile
          >
            {/* LEFT COLUMN: Ingredients */}
            <Box flex="1" w="100%">
              <Heading as="h2" fontSize="xl" mb={4} color="#344e41">
                📝 Ingredients
              </Heading>
              <VStack
                align="stretch"
                spacing={4}
                maxH={{ base: "none", md: "600px" }} // ✅ scroll only on desktop
                overflowY={{ base: "visible", md: "auto" }}
                pr={{ base: 0, md: 2 }}
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
                    transition="all 0.2s"
                    _hover={{ transform: "scale(1.02)", boxShadow: "md" }}
                  >
                    <CardBody py={3}>
                      <HStack
                        justify="space-between"
                        align="start"
                        spacing={2}
                        wrap="wrap" // ✅ prevent overlap on small screens
                      >
                        <Checkbox
                          colorScheme="green"
                          size="lg"
                          isChecked={ing.checked}
                          onChange={() => toggleCheck(ing.id)}
                          transition="transform 0.15s"
                          _checked={{ transform: "scale(1.1)" }}
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
                          transition="all 0.2s"
                          _hover={{
                            transform: "rotate(90deg)",
                            color: "red.500",
                          }}
                        />
                      </HStack>

                      {/* Note field */}
                      <Input
                        mt={2}
                        placeholder="Add note (e.g. buy organic)"
                        size="sm"
                        value={ing.note}
                        onChange={(e) => updateNote(ing.id, e.target.value)}
                        bg="white"
                        disabled={ing.crossed}
                        transition="border 0.2s, box-shadow 0.2s"
                        _focus={{
                          borderColor: "green.400",
                          boxShadow: "0 0 0 1px green",
                        }}
                      />
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </Box>

            {/* RIGHT COLUMN: Custom item + Still Needed + Buttons */}
            <Box flex="1.5">
              {/* Add Custom Item */}
              <Card bg="#fefae0" borderRadius="xl" mb={8}>
                <CardBody>
                  <HStack spacing={2} flexDir={{ base: "column", sm: "row" }}>
                    <Input
                      placeholder="Add custom item to the list..."
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      bg="gray.50"
                    />
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="green"
                      onClick={addCustomItem}
                      padding={"5"}
                      transition="all 0.2s"
                      _hover={{ transform: "scale(1.05)", bg: "green.500" }}
                    >
                      Add to list
                    </Button>
                  </HStack>
                </CardBody>
              </Card>

              {/* Needed Preview */}
              <Heading as="h2" fontSize="xl" mb={4} color="#344e41">
                ✅ Still Needed
              </Heading>
              <Card bg="#fefae0" borderRadius="xl" mb={6}>
                <CardBody>
                  {neededIngredients.length > 0 ? (
                    <VStack align="start" spacing={2}>
                      {neededIngredients.map((ing) => (
                        <Text
                          key={ing.id}
                          transition="all 0.2s"
                          _hover={{
                            color: "green.600",
                            transform: "translateX(5px)",
                          }}
                        >
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
                            <Text
                              as="span"
                              color="orange.600"
                              fontStyle="italic"
                            >
                              {" "}
                              ({ing.note})
                            </Text>
                          )}
                        </Text>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500">
                      🎉 All ingredients accounted for!
                    </Text>
                  )}
                </CardBody>
              </Card>
              <VStack spacing={4}>
                {/* Placeholder Email button */}
                <Button
                  size="md"
                  w="100%"
                  mb={4}
                  bgGradient="linear(to-r, #344e41, #588157)"
                  color="white"
                  transition="all 0.3s"
                  _hover={{
                    transform: "scale(1.03)",
                    bgGradient: "linear(to-r, #ccd5ae, #a3b18a)",
                    color: "black",
                  }}
                  isLoading={sendingEmail}
                  onClick={handleEmailClick}
                >
                  📧 Email me this grocery list
                </Button>

                {/* Placeholder SMS button */}
                <Button
                  size="md"
                  w="100%"
                  bgGradient="linear(to-r, #344e41, #588157)"
                  color="white"
                  transition="all 0.3s"
                  _hover={{
                    transform: "scale(1.03)",
                    bgGradient: "linear(to-r, #ccd5ae, #a3b18a)",
                    color: "black",
                  }}
                  onClick={handleSmsClick}
                >
                  📱 Text me this grocery list
                </Button>
              </VStack>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
