import foodPrices from "./foodPrices";
import OrderSection from "./OrderSection";
import { useEffect, useState } from "react";
import "./App.css";
import FoodManagement from "./FoodManagement";
import AmmuChatbot from "./components/AmmuChatbot";
import { getFoodPrice } from "./data/foodData";

import backgroundImage from "./assets/background image.avif";
import healthyImage from "./assets/healthy image.jpg";

/* =========================================================
   DIET MODE - 100 HEALTHY VEGETARIAN ITEMS
   ========================================================= */

const dietFoods = [
  { id: 1, name: "Idli", category: "Breakfast", calories: 120, serving: "2 pieces", ingredients: "Rice, urad dal, water", protein: "4 g" },
  { id: 2, name: "Vegetable Upma", category: "Breakfast", calories: 180, serving: "1 cup", ingredients: "Rava, carrot, beans, peas, onion", protein: "5 g" },
  { id: 3, name: "Plain Dosa", category: "Breakfast", calories: 160, serving: "1 medium", ingredients: "Rice, urad dal, water", protein: "4 g" },
  { id: 4, name: "Oats Porridge", category: "Breakfast", calories: 150, serving: "1 bowl", ingredients: "Oats, low-fat milk, cinnamon", protein: "6 g" },
  { id: 5, name: "Vegetable Poha", category: "Breakfast", calories: 170, serving: "1 cup", ingredients: "Poha, onion, carrot, peas", protein: "4 g" },
  { id: 6, name: "Ragi Idli", category: "Breakfast", calories: 130, serving: "2 pieces", ingredients: "Ragi, rice, urad dal", protein: "4 g" },
  { id: 7, name: "Moong Dal Chilla", category: "Breakfast", calories: 170, serving: "2 small", ingredients: "Moong dal, onion, coriander", protein: "9 g" },
  { id: 8, name: "Vegetable Oats", category: "Breakfast", calories: 180, serving: "1 bowl", ingredients: "Oats, carrot, beans, peas", protein: "7 g" },
  { id: 9, name: "Ragi Porridge", category: "Breakfast", calories: 150, serving: "1 bowl", ingredients: "Ragi flour, water, low-fat milk", protein: "5 g" },
  { id: 10, name: "Vegetable Semiya", category: "Breakfast", calories: 180, serving: "1 cup", ingredients: "Vermicelli, carrot, beans, peas", protein: "5 g" },

  { id: 11, name: "Cucumber Salad", category: "Salads", calories: 45, serving: "1 bowl", ingredients: "Cucumber, lemon, coriander", protein: "2 g" },
  { id: 12, name: "Carrot Salad", category: "Salads", calories: 70, serving: "1 bowl", ingredients: "Carrot, lemon, coriander", protein: "1 g" },
  { id: 13, name: "Tomato Salad", category: "Salads", calories: 50, serving: "1 bowl", ingredients: "Tomato, cucumber, lemon", protein: "2 g" },
  { id: 14, name: "Cucumber Tomato Salad", category: "Salads", calories: 60, serving: "1 bowl", ingredients: "Cucumber, tomato, coriander", protein: "2 g" },
  { id: 15, name: "Beetroot Salad", category: "Salads", calories: 75, serving: "1 bowl", ingredients: "Beetroot, lemon, coriander", protein: "2 g" },
  { id: 16, name: "Sprouted Moong Salad", category: "Salads", calories: 140, serving: "1 cup", ingredients: "Sprouted moong, cucumber, tomato", protein: "9 g" },
  { id: 17, name: "Corn Cucumber Salad", category: "Salads", calories: 130, serving: "1 bowl", ingredients: "Sweet corn, cucumber, tomato", protein: "4 g" },
  { id: 18, name: "Carrot Cucumber Salad", category: "Salads", calories: 65, serving: "1 bowl", ingredients: "Carrot, cucumber, lemon", protein: "2 g" },
  { id: 19, name: "Apple Cucumber Salad", category: "Salads", calories: 100, serving: "1 bowl", ingredients: "Apple, cucumber, lemon", protein: "1 g" },
  { id: 20, name: "Chickpea Vegetable Salad", category: "Salads", calories: 190, serving: "1 cup", ingredients: "Chickpeas, cucumber, tomato", protein: "9 g" },

  { id: 21, name: "Sprouted Green Gram", category: "Sprouts", calories: 140, serving: "1 cup", ingredients: "Sprouted green gram, lemon", protein: "9 g" },
  { id: 22, name: "Boiled Green Gram", category: "Sprouts", calories: 150, serving: "1 cup", ingredients: "Green gram, water", protein: "10 g" },
  { id: 23, name: "Boiled Chickpeas", category: "Legumes", calories: 190, serving: "1/2 cup", ingredients: "Chickpeas, water", protein: "10 g" },
  { id: 24, name: "Boiled Black Chana", category: "Legumes", calories: 180, serving: "1/2 cup", ingredients: "Black chickpeas, water", protein: "9 g" },
  { id: 25, name: "Boiled Cowpeas", category: "Legumes", calories: 170, serving: "1/2 cup", ingredients: "Cowpeas, water", protein: "10 g" },
  { id: 26, name: "Boiled Masoor Dal", category: "Legumes", calories: 115, serving: "1/2 cup", ingredients: "Red lentils, water", protein: "9 g" },
  { id: 27, name: "Boiled Moong Dal", category: "Legumes", calories: 105, serving: "1/2 cup", ingredients: "Moong dal, water", protein: "7 g" },
  { id: 28, name: "Boiled Toor Dal", category: "Legumes", calories: 125, serving: "1/2 cup", ingredients: "Toor dal, water", protein: "8 g" },
  { id: 29, name: "Sprouted Black Chana", category: "Sprouts", calories: 160, serving: "1/2 cup", ingredients: "Sprouted black chana, lemon", protein: "8 g" },
  { id: 30, name: "Mixed Sprouts Bowl", category: "Sprouts", calories: 160, serving: "1 cup", ingredients: "Moong sprouts, chickpea sprouts", protein: "10 g" },

  { id: 31, name: "Apple", category: "Fruits", calories: 77, serving: "1 small", ingredients: "Fresh apple", protein: "0.4 g" },
  { id: 32, name: "Guava", category: "Fruits", calories: 68, serving: "1 medium", ingredients: "Fresh guava", protein: "2.5 g" },
  { id: 33, name: "Orange", category: "Fruits", calories: 62, serving: "1 medium", ingredients: "Fresh orange", protein: "1.2 g" },
  { id: 34, name: "Papaya", category: "Fruits", calories: 60, serving: "1 cup", ingredients: "Fresh papaya", protein: "1 g" },
  { id: 35, name: "Watermelon", category: "Fruits", calories: 46, serving: "1 cup", ingredients: "Fresh watermelon", protein: "1 g" },
  { id: 36, name: "Muskmelon", category: "Fruits", calories: 54, serving: "1 cup", ingredients: "Fresh muskmelon", protein: "1.3 g" },
  { id: 37, name: "Pear", category: "Fruits", calories: 85, serving: "1 small", ingredients: "Fresh pear", protein: "0.5 g" },
  { id: 38, name: "Pineapple", category: "Fruits", calories: 82, serving: "1 cup", ingredients: "Fresh pineapple", protein: "0.8 g" },
  { id: 39, name: "Pomegranate", category: "Fruits", calories: 120, serving: "1/2 cup", ingredients: "Pomegranate seeds", protein: "1.5 g" },
  { id: 40, name: "Kiwi", category: "Fruits", calories: 84, serving: "2 small", ingredients: "Fresh kiwi", protein: "1.6 g" },
  { id: 41, name: "Peach", category: "Fruits", calories: 60, serving: "1 medium", ingredients: "Fresh peach", protein: "1 g" },
  { id: 42, name: "Plum", category: "Fruits", calories: 46, serving: "2 small", ingredients: "Fresh plum", protein: "0.7 g" },
  { id: 43, name: "Strawberries", category: "Fruits", calories: 50, serving: "1 cup", ingredients: "Fresh strawberries", protein: "1 g" },
  { id: 44, name: "Blueberries", category: "Fruits", calories: 84, serving: "1 cup", ingredients: "Fresh blueberries", protein: "1 g" },
  { id: 45, name: "Mango", category: "Fruits", calories: 100, serving: "1/2 cup", ingredients: "Fresh mango", protein: "1 g" },

  { id: 46, name: "Steamed Broccoli", category: "Vegetables", calories: 55, serving: "1 cup", ingredients: "Broccoli", protein: "4 g" },
  { id: 47, name: "Steamed Carrot", category: "Vegetables", calories: 55, serving: "1 cup", ingredients: "Carrot", protein: "1 g" },
  { id: 48, name: "Steamed Beans", category: "Vegetables", calories: 45, serving: "1 cup", ingredients: "Green beans", protein: "2 g" },
  { id: 49, name: "Boiled Sweet Corn", category: "Vegetables", calories: 120, serving: "1 cup", ingredients: "Sweet corn", protein: "4 g" },
  { id: 50, name: "Boiled Potato", category: "Vegetables", calories: 130, serving: "1 medium", ingredients: "Potato, water", protein: "3 g" },
  { id: 51, name: "Steamed Cauliflower", category: "Vegetables", calories: 40, serving: "1 cup", ingredients: "Cauliflower", protein: "3 g" },
  { id: 52, name: "Bottle Gourd", category: "Vegetables", calories: 35, serving: "1 cup", ingredients: "Bottle gourd", protein: "1 g" },
  { id: 53, name: "Ridge Gourd", category: "Vegetables", calories: 40, serving: "1 cup", ingredients: "Ridge gourd", protein: "1 g" },
  { id: 54, name: "Cabbage Stir Fry", category: "Vegetables", calories: 80, serving: "1 cup", ingredients: "Cabbage, carrot, spices", protein: "2 g" },
  { id: 55, name: "Spinach Stir Fry", category: "Vegetables", calories: 70, serving: "1 cup", ingredients: "Spinach, garlic, spices", protein: "4 g" },
  { id: 56, name: "Mixed Steamed Vegetables", category: "Vegetables", calories: 100, serving: "1.5 cups", ingredients: "Carrot, beans, broccoli", protein: "5 g" },
  { id: 57, name: "Pumpkin Curry", category: "Vegetables", calories: 100, serving: "1 cup", ingredients: "Pumpkin, onion, spices", protein: "2 g" },
  { id: 58, name: "Drumstick Vegetable", category: "Vegetables", calories: 80, serving: "1 cup", ingredients: "Drumstick, spices", protein: "3 g" },
  { id: 59, name: "Ash Gourd Curry", category: "Vegetables", calories: 70, serving: "1 cup", ingredients: "Ash gourd, spices", protein: "2 g" },
  { id: 60, name: "Lady Finger Stir Fry", category: "Vegetables", calories: 100, serving: "1 cup", ingredients: "Okra, onion, spices", protein: "3 g" },

  { id: 61, name: "Roasted Makhana", category: "Snacks", calories: 100, serving: "1 cup", ingredients: "Makhana, mild seasoning", protein: "3 g" },
  { id: 62, name: "Roasted Chickpeas", category: "Snacks", calories: 150, serving: "1/3 cup", ingredients: "Chickpeas, mild spices", protein: "7 g" },
  { id: 63, name: "Roasted Green Gram", category: "Snacks", calories: 140, serving: "1/3 cup", ingredients: "Green gram", protein: "9 g" },
  { id: 64, name: "Air-Popped Popcorn", category: "Snacks", calories: 120, serving: "3 cups", ingredients: "Corn kernels", protein: "4 g" },
  { id: 65, name: "Boiled Corn Cup", category: "Snacks", calories: 120, serving: "1 cup", ingredients: "Sweet corn", protein: "4 g" },
  { id: 66, name: "Fruit Bowl", category: "Snacks", calories: 140, serving: "1 bowl", ingredients: "Apple, papaya, orange", protein: "2 g" },
  { id: 67, name: "Cucumber Lemon Bowl", category: "Snacks", calories: 40, serving: "1 bowl", ingredients: "Cucumber, lemon", protein: "2 g" },
  { id: 68, name: "Carrot Sticks", category: "Snacks", calories: 50, serving: "1 cup", ingredients: "Fresh carrot", protein: "1 g" },
  { id: 69, name: "Apple Slices", category: "Snacks", calories: 80, serving: "1 small apple", ingredients: "Fresh apple", protein: "0.4 g" },
  { id: 70, name: "Guava Slices", category: "Snacks", calories: 70, serving: "1 medium", ingredients: "Fresh guava", protein: "2.5 g" },

  { id: 71, name: "Buttermilk", category: "Drinks", calories: 45, serving: "1 glass", ingredients: "Low-fat curd, water, coriander", protein: "3 g" },
  { id: 72, name: "Lemon Water", category: "Drinks", calories: 10, serving: "1 glass", ingredients: "Water, lemon", protein: "0 g" },
  { id: 73, name: "Coconut Water", category: "Drinks", calories: 45, serving: "1 glass", ingredients: "Fresh coconut water", protein: "2 g" },
  { id: 74, name: "Mint Lemon Water", category: "Drinks", calories: 12, serving: "1 glass", ingredients: "Water, lemon, mint", protein: "0 g" },
  { id: 75, name: "Cucumber Mint Water", category: "Drinks", calories: 10, serving: "1 glass", ingredients: "Water, cucumber, mint", protein: "0 g" },
  { id: 76, name: "Low-Fat Milk", category: "Drinks", calories: 100, serving: "1 glass", ingredients: "Low-fat milk", protein: "8 g" },
  { id: 77, name: "Unsweetened Soy Milk", category: "Drinks", calories: 80, serving: "1 glass", ingredients: "Unsweetened soy milk", protein: "7 g" },
  { id: 78, name: "Tomato Juice", category: "Drinks", calories: 40, serving: "1 glass", ingredients: "Fresh tomato, water", protein: "2 g" },
  { id: 79, name: "Watermelon Juice", category: "Drinks", calories: 70, serving: "1 glass", ingredients: "Fresh watermelon", protein: "1 g" },
  { id: 80, name: "Papaya Smoothie", category: "Drinks", calories: 150, serving: "1 glass", ingredients: "Papaya, low-fat milk", protein: "6 g" },

  { id: 81, name: "Vegetable Khichdi", category: "Light Meals", calories: 190, serving: "1 cup", ingredients: "Rice, moong dal, vegetables", protein: "7 g" },
  { id: 82, name: "Moong Dal Soup", category: "Light Meals", calories: 130, serving: "1 bowl", ingredients: "Moong dal, carrot, tomato", protein: "8 g" },
  { id: 83, name: "Vegetable Soup", category: "Light Meals", calories: 90, serving: "1 bowl", ingredients: "Carrot, beans, cabbage, tomato", protein: "3 g" },
  { id: 84, name: "Tomato Soup", category: "Light Meals", calories: 80, serving: "1 bowl", ingredients: "Tomato, onion, herbs", protein: "2 g" },
  { id: 85, name: "Spinach Soup", category: "Light Meals", calories: 70, serving: "1 bowl", ingredients: "Spinach, onion, herbs", protein: "4 g" },
  { id: 86, name: "Mixed Dal Soup", category: "Light Meals", calories: 150, serving: "1 bowl", ingredients: "Moong dal, masoor dal, vegetables", protein: "9 g" },
  { id: 87, name: "Vegetable Oats Soup", category: "Light Meals", calories: 150, serving: "1 bowl", ingredients: "Oats, carrot, beans, tomato", protein: "6 g" },
  { id: 88, name: "Lentil Vegetable Bowl", category: "Light Meals", calories: 180, serving: "1 bowl", ingredients: "Lentils, carrot, spinach, tomato", protein: "11 g" },
  { id: 89, name: "Moong Dal Vegetable Bowl", category: "Light Meals", calories: 170, serving: "1 bowl", ingredients: "Moong dal, vegetables, coriander", protein: "10 g" },
  { id: 90, name: "Vegetable Ragi Bowl", category: "Light Meals", calories: 190, serving: "1 bowl", ingredients: "Ragi, vegetables, spices", protein: "6 g" },

  { id: 91, name: "Curd Cucumber Bowl", category: "Healthy Options", calories: 90, serving: "1 bowl", ingredients: "Low-fat curd, cucumber", protein: "5 g" },
  { id: 92, name: "Curd Fruit Bowl", category: "Healthy Options", calories: 150, serving: "1 bowl", ingredients: "Low-fat curd, apple, papaya", protein: "6 g" },
  { id: 93, name: "Oats Fruit Bowl", category: "Healthy Options", calories: 190, serving: "1 bowl", ingredients: "Oats, apple, papaya", protein: "6 g" },
  { id: 94, name: "Moong Dal Salad", category: "Healthy Options", calories: 160, serving: "1 cup", ingredients: "Moong dal, cucumber, tomato", protein: "9 g" },
  { id: 95, name: "Vegetable Sprout Bowl", category: "Healthy Options", calories: 150, serving: "1 bowl", ingredients: "Sprouts, carrot, cucumber", protein: "8 g" },
  { id: 96, name: "Ragi Vegetable Upma", category: "Healthy Options", calories: 190, serving: "1 cup", ingredients: "Ragi semolina, vegetables", protein: "6 g" },
  { id: 97, name: "Vegetable Dalia", category: "Healthy Options", calories: 180, serving: "1 cup", ingredients: "Broken wheat, carrot, beans", protein: "6 g" },
  { id: 98, name: "Moong Dal Dosa", category: "Healthy Options", calories: 180, serving: "2 small", ingredients: "Moong dal, coriander, onion", protein: "10 g" },
  { id: 99, name: "Vegetable Rava Idli", category: "Healthy Options", calories: 170, serving: "2 pieces", ingredients: "Rava, carrot, beans, curd", protein: "5 g" },
  { id: 100, name: "Healthy Mixed Salad", category: "Healthy Options", calories: 120, serving: "1 large bowl", ingredients: "Cucumber, carrot, tomato, beetroot", protein: "3 g" },
];


/* =========================================================
   NORMAL MODE - 100 ITEMS
   ========================================================= */

const normalFoods = [
  { id: 101, name: "Masala Dosa", category: "South Indian", calories: 350, serving: "1 large", ingredients: "Rice, urad dal, potato masala", protein: "7 g" },
  { id: 102, name: "Masala Idli", category: "South Indian", calories: 300, serving: "4 pieces", ingredients: "Rice, urad dal, vegetables", protein: "8 g" },
  { id: 103, name: "Vegetable Uttapam", category: "South Indian", calories: 380, serving: "2 medium", ingredients: "Rice, urad dal, vegetables", protein: "9 g" },
  { id: 104, name: "Paneer Dosa", category: "South Indian", calories: 420, serving: "1 large", ingredients: "Dosa, paneer, spices", protein: "15 g" },
  { id: 105, name: "Onion Dosa", category: "South Indian", calories: 330, serving: "1 large", ingredients: "Rice, urad dal, onion", protein: "7 g" },
  { id: 106, name: "Ghee Roast Dosa", category: "South Indian", calories: 450, serving: "1 large", ingredients: "Rice, urad dal, ghee", protein: "7 g" },
  { id: 107, name: "Cheese Dosa", category: "South Indian", calories: 400, serving: "1 large", ingredients: "Dosa, cheese, vegetables", protein: "14 g" },
  { id: 108, name: "Pongal", category: "South Indian", calories: 380, serving: "1.5 cups", ingredients: "Rice, moong dal, ghee", protein: "9 g" },
  { id: 109, name: "Ven Pongal with Chutney", category: "South Indian", calories: 420, serving: "1 plate", ingredients: "Rice, moong dal, chutney", protein: "9 g" },
  { id: 110, name: "Poori Masala", category: "South Indian", calories: 450, serving: "2 pooris", ingredients: "Wheat flour, potato masala", protein: "8 g" },

  { id: 111, name: "Chapati Paneer", category: "North Indian", calories: 400, serving: "2 chapati", ingredients: "Wheat, paneer, vegetables", protein: "15 g" },
  { id: 112, name: "Aloo Paratha", category: "North Indian", calories: 350, serving: "1 large", ingredients: "Wheat, potato, spices", protein: "8 g" },
  { id: 113, name: "Paneer Paratha", category: "North Indian", calories: 420, serving: "1 large", ingredients: "Wheat, paneer, spices", protein: "15 g" },
  { id: 114, name: "Gobi Paratha", category: "North Indian", calories: 350, serving: "1 large", ingredients: "Wheat, cauliflower, spices", protein: "8 g" },
  { id: 115, name: "Stuffed Vegetable Paratha", category: "North Indian", calories: 380, serving: "1 large", ingredients: "Wheat, mixed vegetables", protein: "9 g" },
  { id: 116, name: "Chole Bhature", category: "North Indian", calories: 480, serving: "1 plate", ingredients: "Chickpeas, refined flour", protein: "13 g" },
  { id: 117, name: "Rajma Rice", category: "Rice & Meals", calories: 430, serving: "1 plate", ingredients: "Rice, kidney beans, spices", protein: "13 g" },
  { id: 118, name: "Dal Rice", category: "Rice & Meals", calories: 380, serving: "1 plate", ingredients: "Rice, dal, spices", protein: "12 g" },
  { id: 119, name: "Sambar Rice", category: "Rice & Meals", calories: 350, serving: "1 plate", ingredients: "Rice, sambar, vegetables", protein: "9 g" },
  { id: 120, name: "Curd Rice", category: "Rice & Meals", calories: 350, serving: "1.5 cups", ingredients: "Rice, curd, seasoning", protein: "9 g" },

  { id: 121, name: "Lemon Rice", category: "Rice & Meals", calories: 390, serving: "1.5 cups", ingredients: "Rice, lemon, peanuts, spices", protein: "8 g" },
  { id: 122, name: "Tomato Rice", category: "Rice & Meals", calories: 380, serving: "1.5 cups", ingredients: "Rice, tomato, spices", protein: "8 g" },
  { id: 123, name: "Vegetable Pulao", category: "Rice & Meals", calories: 400, serving: "1.5 cups", ingredients: "Rice, vegetables, spices", protein: "9 g" },
  { id: 124, name: "Peas Pulao", category: "Rice & Meals", calories: 390, serving: "1.5 cups", ingredients: "Rice, peas, spices", protein: "9 g" },
  { id: 125, name: "Paneer Fried Rice", category: "Rice & Meals", calories: 480, serving: "1 plate", ingredients: "Rice, paneer, vegetables", protein: "16 g" },
  { id: 126, name: "Vegetable Fried Rice", category: "Rice & Meals", calories: 450, serving: "1 plate", ingredients: "Rice, vegetables, sauces", protein: "8 g" },
  { id: 127, name: "Veg Biryani", category: "Rice & Meals", calories: 450, serving: "1 plate", ingredients: "Basmati rice, vegetables, spices", protein: "9 g" },
  { id: 128, name: "Paneer Biryani", category: "Rice & Meals", calories: 490, serving: "1 plate", ingredients: "Basmati rice, paneer, spices", protein: "16 g" },
  { id: 129, name: "Mushroom Biryani", category: "Rice & Meals", calories: 460, serving: "1 plate", ingredients: "Rice, mushroom, spices", protein: "10 g" },
  { id: 130, name: "Chicken Biryani", category: "Rice & Meals", calories: 500, serving: "1 plate", ingredients: "Basmati rice, chicken, spices", protein: "25 g" },

  { id: 131, name: "Chicken Fried Rice", category: "Rice & Meals", calories: 490, serving: "1 plate", ingredients: "Rice, chicken, vegetables", protein: "24 g" },
  { id: 132, name: "Egg Fried Rice", category: "Rice & Meals", calories: 470, serving: "1 plate", ingredients: "Rice, eggs, vegetables", protein: "17 g" },
  { id: 133, name: "Chicken Pulao", category: "Rice & Meals", calories: 480, serving: "1 plate", ingredients: "Rice, chicken, spices", protein: "24 g" },
  { id: 134, name: "Egg Biryani", category: "Rice & Meals", calories: 470, serving: "1 plate", ingredients: "Rice, eggs, spices", protein: "18 g" },
  { id: 135, name: "Vegetable Noodles", category: "Fast Food", calories: 400, serving: "1 plate", ingredients: "Noodles, vegetables, sauces", protein: "8 g" },
  { id: 136, name: "Paneer Noodles", category: "Fast Food", calories: 450, serving: "1 plate", ingredients: "Noodles, paneer, vegetables", protein: "15 g" },
  { id: 137, name: "Egg Noodles", category: "Fast Food", calories: 450, serving: "1 plate", ingredients: "Noodles, eggs, vegetables", protein: "16 g" },
  { id: 138, name: "Chicken Noodles", category: "Fast Food", calories: 490, serving: "1 plate", ingredients: "Noodles, chicken, vegetables", protein: "24 g" },
  { id: 139, name: "Hakka Noodles", category: "Fast Food", calories: 450, serving: "1 plate", ingredients: "Noodles, vegetables, sauces", protein: "9 g" },
  { id: 140, name: "Schezwan Noodles", category: "Fast Food", calories: 480, serving: "1 plate", ingredients: "Noodles, vegetables, schezwan sauce", protein: "9 g" },

  { id: 141, name: "Veg Manchurian", category: "Vegetarian", calories: 420, serving: "1 plate", ingredients: "Vegetables, flour, sauces", protein: "8 g" },
  { id: 142, name: "Paneer Manchurian", category: "Vegetarian", calories: 450, serving: "1 plate", ingredients: "Paneer, vegetables, sauces", protein: "17 g" },
  { id: 143, name: "Gobi Manchurian", category: "Vegetarian", calories: 400, serving: "1 plate", ingredients: "Cauliflower, flour, sauces", protein: "8 g" },
  { id: 144, name: "Chilli Paneer", category: "Vegetarian", calories: 450, serving: "1 plate", ingredients: "Paneer, capsicum, sauces", protein: "18 g" },
  { id: 145, name: "Chilli Mushroom", category: "Vegetarian", calories: 400, serving: "1 plate", ingredients: "Mushroom, capsicum, sauces", protein: "10 g" },
  { id: 146, name: "Paneer Tikka", category: "Vegetarian", calories: 350, serving: "6 pieces", ingredients: "Paneer, yogurt, spices", protein: "20 g" },
  { id: 147, name: "Paneer Butter Masala", category: "Vegetarian", calories: 400, serving: "1 cup", ingredients: "Paneer, tomato, butter, cream", protein: "17 g" },
  { id: 148, name: "Kadai Paneer", category: "Vegetarian", calories: 390, serving: "1 cup", ingredients: "Paneer, capsicum, tomato", protein: "17 g" },
  { id: 149, name: "Palak Paneer", category: "Vegetarian", calories: 350, serving: "1 cup", ingredients: "Paneer, spinach, spices", protein: "18 g" },
  { id: 150, name: "Shahi Paneer", category: "Vegetarian", calories: 450, serving: "1 cup", ingredients: "Paneer, cream, nuts, spices", protein: "17 g" },

  { id: 151, name: "Mixed Vegetable Curry", category: "Vegetarian", calories: 300, serving: "1 cup", ingredients: "Mixed vegetables, spices", protein: "6 g" },
  { id: 152, name: "Malai Kofta", category: "Vegetarian", calories: 450, serving: "1 cup", ingredients: "Paneer, vegetables, cream", protein: "13 g" },
  { id: 153, name: "Dal Makhani", category: "Vegetarian", calories: 400, serving: "1 cup", ingredients: "Black lentils, butter, cream", protein: "13 g" },
  { id: 154, name: "Chana Masala", category: "Vegetarian", calories: 350, serving: "1 cup", ingredients: "Chickpeas, tomato, spices", protein: "15 g" },
  { id: 155, name: "Rajma Masala", category: "Vegetarian", calories: 350, serving: "1 cup", ingredients: "Kidney beans, tomato, spices", protein: "14 g" },
  { id: 156, name: "Aloo Gobi", category: "Vegetarian", calories: 300, serving: "1 cup", ingredients: "Potato, cauliflower, spices", protein: "6 g" },
  { id: 157, name: "Bhindi Masala", category: "Vegetarian", calories: 300, serving: "1 cup", ingredients: "Okra, onion, tomato", protein: "5 g" },
  { id: 158, name: "Vegetable Korma", category: "Vegetarian", calories: 400, serving: "1 cup", ingredients: "Mixed vegetables, coconut, spices", protein: "7 g" },
  { id: 159, name: "Veg Cutlet", category: "Snacks", calories: 350, serving: "3 pieces", ingredients: "Potato, vegetables, breadcrumbs", protein: "7 g" },
  { id: 160, name: "Samosa", category: "Snacks", calories: 400, serving: "2 pieces", ingredients: "Potato, refined flour, spices", protein: "7 g" },

  { id: 161, name: "Paneer Roll", category: "Snacks", calories: 450, serving: "1 roll", ingredients: "Paneer, roti, vegetables", protein: "18 g" },
  { id: 162, name: "Veg Spring Roll", category: "Snacks", calories: 350, serving: "3 pieces", ingredients: "Vegetables, wrapper", protein: "7 g" },
  { id: 163, name: "Cheese Sandwich", category: "Snacks", calories: 400, serving: "1 sandwich", ingredients: "Bread, cheese, vegetables", protein: "15 g" },
  { id: 164, name: "Vegetable Sandwich", category: "Snacks", calories: 300, serving: "1 sandwich", ingredients: "Bread, vegetables, chutney", protein: "8 g" },
  { id: 165, name: "Paneer Sandwich", category: "Snacks", calories: 420, serving: "1 sandwich", ingredients: "Bread, paneer, vegetables", protein: "18 g" },
  { id: 166, name: "Grilled Cheese Sandwich", category: "Snacks", calories: 450, serving: "1 sandwich", ingredients: "Bread, cheese, butter", protein: "17 g" },
  { id: 167, name: "Veg Burger", category: "Fast Food", calories: 400, serving: "1 burger", ingredients: "Burger bun, vegetable patty, vegetables", protein: "10 g" },
  { id: 168, name: "Paneer Burger", category: "Fast Food", calories: 450, serving: "1 burger", ingredients: "Bun, paneer patty, vegetables", protein: "18 g" },
  { id: 169, name: "Veg Pizza", category: "Fast Food", calories: 400, serving: "2 slices", ingredients: "Pizza base, cheese, vegetables", protein: "15 g" },
  { id: 170, name: "Paneer Pizza", category: "Fast Food", calories: 450, serving: "2 slices", ingredients: "Pizza base, cheese, paneer", protein: "20 g" },

  { id: 171, name: "Margherita Pizza", category: "Fast Food", calories: 420, serving: "2 slices", ingredients: "Pizza base, tomato, mozzarella", protein: "18 g" },
  { id: 172, name: "Chicken Pizza", category: "Fast Food", calories: 480, serving: "2 slices", ingredients: "Pizza base, cheese, chicken", protein: "25 g" },
  { id: 173, name: "Chicken Tikka", category: "Chicken", calories: 350, serving: "6 pieces", ingredients: "Chicken, yogurt, spices", protein: "35 g" },
  { id: 174, name: "Chicken Kebab", category: "Chicken", calories: 400, serving: "5 pieces", ingredients: "Chicken, spices, herbs", protein: "32 g" },
  { id: 175, name: "Chicken 65", category: "Chicken", calories: 450, serving: "6 pieces", ingredients: "Chicken, flour, spices", protein: "30 g" },
  { id: 176, name: "Chicken Manchurian", category: "Chicken", calories: 450, serving: "1 plate", ingredients: "Chicken, vegetables, sauces", protein: "30 g" },
  { id: 177, name: "Chilli Chicken", category: "Chicken", calories: 450, serving: "1 plate", ingredients: "Chicken, capsicum, sauces", protein: "30 g" },
  { id: 178, name: "Chicken Curry", category: "Chicken", calories: 400, serving: "1 cup", ingredients: "Chicken, tomato, onion, spices", protein: "32 g" },
  { id: 179, name: "Butter Chicken", category: "Chicken", calories: 480, serving: "1 cup", ingredients: "Chicken, tomato, butter, cream", protein: "30 g" },
  { id: 180, name: "Kadai Chicken", category: "Chicken", calories: 450, serving: "1 cup", ingredients: "Chicken, capsicum, tomato", protein: "32 g" },

  { id: 181, name: "Chicken Tikka Masala", category: "Chicken", calories: 480, serving: "1 cup", ingredients: "Chicken, tomato, cream, spices", protein: "30 g" },
  { id: 182, name: "Grilled Chicken", category: "Chicken", calories: 350, serving: "150 g", ingredients: "Chicken, herbs, spices", protein: "42 g" },
  { id: 183, name: "Chicken Seekh Kebab", category: "Chicken", calories: 400, serving: "4 pieces", ingredients: "Minced chicken, herbs, spices", protein: "32 g" },
  { id: 184, name: "Chicken 65 Rice", category: "Chicken", calories: 500, serving: "1 plate", ingredients: "Rice, chicken 65, spices", protein: "28 g" },
  { id: 185, name: "Fish Fry", category: "Fish & Seafood", calories: 400, serving: "2 pieces", ingredients: "Fish, flour, spices", protein: "30 g" },
  { id: 186, name: "Grilled Fish", category: "Fish & Seafood", calories: 320, serving: "150 g", ingredients: "Fish, herbs, lemon", protein: "35 g" },
  { id: 187, name: "Fish Curry", category: "Fish & Seafood", calories: 350, serving: "1 cup", ingredients: "Fish, coconut, spices", protein: "30 g" },
  { id: 188, name: "Fish Biryani", category: "Fish & Seafood", calories: 490, serving: "1 plate", ingredients: "Rice, fish, spices", protein: "28 g" },
  { id: 189, name: "Prawn Curry", category: "Fish & Seafood", calories: 400, serving: "1 cup", ingredients: "Prawns, coconut, spices", protein: "30 g" },
  { id: 190, name: "Prawn Fry", category: "Fish & Seafood", calories: 350, serving: "100 g", ingredients: "Prawns, spices", protein: "25 g" },

  { id: 191, name: "Egg Omelette", category: "Egg", calories: 300, serving: "3 eggs", ingredients: "Eggs, onion, coriander", protein: "20 g" },
  { id: 192, name: "Masala Omelette", category: "Egg", calories: 350, serving: "3 eggs", ingredients: "Eggs, onion, tomato, spices", protein: "21 g" },
  { id: 193, name: "Egg Bhurji", category: "Egg", calories: 350, serving: "3 eggs", ingredients: "Eggs, onion, tomato, spices", protein: "21 g" },
  { id: 194, name: "Egg Curry", category: "Egg", calories: 320, serving: "2 eggs + gravy", ingredients: "Eggs, tomato, onion, spices", protein: "16 g" },
  { id: 195, name: "Egg Paratha", category: "Egg", calories: 400, serving: "1 large", ingredients: "Wheat, egg, spices", protein: "16 g" },
  { id: 196, name: "Egg Sandwich", category: "Egg", calories: 350, serving: "1 sandwich", ingredients: "Bread, eggs, vegetables", protein: "18 g" },
  { id: 197, name: "Egg Roll", category: "Egg", calories: 400, serving: "1 roll", ingredients: "Egg, roti, vegetables", protein: "18 g" },
  { id: 198, name: "Chicken Egg Roll", category: "Egg", calories: 480, serving: "1 roll", ingredients: "Egg, chicken, roti, vegetables", protein: "30 g" },
  { id: 199, name: "Chicken Sandwich", category: "Chicken", calories: 450, serving: "1 sandwich", ingredients: "Bread, chicken, vegetables", protein: "28 g" },
  { id: 200, name: "Chicken Burger", category: "Chicken", calories: 500, serving: "1 burger", ingredients: "Bun, chicken patty, vegetables", protein: "28 g" },
];


/* =========================================================
   APP
   ========================================================= */

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [dietMode, setDietMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [maxCalories, setMaxCalories] =
    useState("all");

  const [cart, setCart] = useState([]);

  // Order history is kept in App state so it survives page navigation.
  const [orders, setOrders] = useState([]);
  const [nextOrderNumber, setNextOrderNumber] = useState(1);
  const [showOrders, setShowOrders] = useState(false);

  const [showCart, setShowCart] =
    useState(false);

  const [showFoodManagement, setShowFoodManagement] =
    useState(false);

    const [managedFoods, setManagedFoods] = useState([]);


async function loadManagedFoods() {
  try {
    const response = await fetch("http://localhost:5001/foods");

    if (!response.ok) {
      throw new Error("Could not load managed foods");
    }

    const data = await response.json();
    setManagedFoods(data);
  } catch (error) {
    console.error("Food API error:", error);
  }
}

useEffect(() => {
  if (!showFoodManagement) {
    loadManagedFoods();
  }
}, [showFoodManagement]);



  /* =======================================================
     LOGIN / SIGNUP
     ======================================================= */

 
async function handleSubmit(e) {
    e.preventDefault();

    if (
        (isSignup && username.trim() === "") ||
        email.trim() === "" ||
        password === ""
    ) {
        setMessage("Please fill all fields.");
        return;
    }

    if (password.length < 5 || password.length > 8) {
        setMessage("Password must contain 5 to 8 characters.");
        return;
    }

    try {
        const endpoint = isSignup
            ? "http://localhost:5001/api/signup"
            : "http://localhost:5001/api/login";

        const requestBody = isSignup
            ? {
                username: username.trim(),
                email: email.trim(),
                password: password
            }
            : {
                email: email.trim(),
                password: password
            };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            setMessage(data.message || "Something went wrong.");
            return;
        }

        if (isSignup) {
            setMessage("Signup successful! Please login.");

            setIsSignup(false);
            setUsername("");
            setPassword("");

        } else {
            setMessage("");
            setLoggedIn(true);

            setUsername(data.user.username);
            setEmail(data.user.email);
            setPassword("");
        }

    } catch (error) {
        console.error("Authentication error:", error);

        setMessage(
            "Unable to connect to Express server. Please try again."
        );
    }
}



  /* =======================================================
     LOGOUT
     ======================================================= */

  function logout() {

    setLoggedIn(false);

    setUsername("");
    setEmail("");
    setPassword("");
    setMessage("");

    setCart([]);
    setOrders([]);
    setNextOrderNumber(1);

    setShowCart(false);
    setShowOrders(false);
    setShowFoodManagement(false);

    setSearchTerm("");

    setSelectedCategory("All");

    setMaxCalories("all");
  }


  function handleOrderComplete(orderData) {
    const orderId =
      "ORD" + String(nextOrderNumber).padStart(4, "0");

    const newOrder = {
      ...orderData,
      orderId
    };

    setOrders(previous => [newOrder, ...previous]);
    setNextOrderNumber(previous => previous + 1);
    setCart([]);
    setShowCart(false);
    setShowFoodManagement(false);
    setShowOrders(true);
  }


  /* =======================================================
     GET CURRENT QUANTITY
     ======================================================= */

  function getCartQuantity(foodId) {

    const item = cart.find(
      (cartItem) =>
        cartItem.id === foodId
    );

    return item
      ? item.quantity
      : 0;
  }


  /* =======================================================
     ADD TO CART
     ======================================================= */

  function addToCart(food) {

    setCart((currentCart) => {

      const existingItem =
        currentCart.find(
          (item) =>
            item.id === food.id
        );

      if (existingItem) {

        return currentCart.map(
          (item) =>
            item.id === food.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      return [
        ...currentCart,

        {
          ...food,
          quantity: 1,
        },
      ];
    });
  }


  /* =======================================================
     DECREASE QUANTITY
     ======================================================= */

  function decreaseQuantity(id) {

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }


  /* =======================================================
     REMOVE ITEM
     ======================================================= */

  function removeFromCart(id) {

    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== id
      )
    );
  }


  /* =======================================================
     CART TOTALS
     ======================================================= */

  const cartCount =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  const cartCalories =
    cart.reduce(
      (total, item) =>
        total +
        item.calories *
          item.quantity,
      0
    );


  /* =======================================================
     CURRENT FOOD LIST
     ======================================================= */

  const foodDetails = {
  "Paneer Biryani": {
    serving: "1 plate",
    protein: "18 g",
    ingredients: "Rice, paneer, onion, spices",
  },
  "Chicken Biryani": {
    serving: "1 plate",
    protein: "30 g",
    ingredients: "Rice, chicken, onion, spices",
  },
  "Veg Burger": {
    serving: "1 burger",
    protein: "8 g",
    ingredients: "Burger bun, vegetable patty, lettuce, sauce",
  },
  "Grilled Chicken": {
    serving: "1 serving",
    protein: "30 g",
    ingredients: "Chicken, pepper, herbs, spices",
  },
  "Veg Salad": {
    serving: "1 bowl",
    protein: "4 g",
    ingredients: "Cucumber, tomato, carrot, lettuce",
  },
  "Fruit Bowl": {
    serving: "1 bowl",
    protein: "2 g",
    ingredients: "Apple, banana, papaya, seasonal fruits",
  },
  "Vegetable Upma": {
    serving: "1 bowl",
    protein: "6 g",
    ingredients: "Semolina, vegetables, mustard seeds, curry leaves",
  },
};

const apiFoods = managedFoods.map((food) => {
  const details = foodDetails[food.name] || {};

  return {
    ...food,
    id: 1000 + Number(food.id),
    apiId: food.id,
    category: food.type,

    serving: food.serving || details.serving || "1 serving",

    protein: food.protein || details.protein || "Not specified",

    ingredients:
      food.ingredients ||
      details.ingredients ||
      "See food details",

    price: Number(food.price),
    calories: Number(food.calories),
  };
});

const currentFoods = [
  ...(dietMode ? dietFoods : normalFoods),
  ...apiFoods.filter((food) =>
    dietMode
      ? food.type === "Diet"
      : food.type === "Normal"
  ),
].map((food) => ({
  ...food,
  price: Number(food.price ?? foodPrices[food.name] ?? getFoodPrice(food))
}));


  /* =======================================================
     CATEGORIES
     ======================================================= */

  const categories = [
    "All",

    ...new Set(
      currentFoods.map(
        (food) =>
          food.category
      )
    ),
  ];


  /* =======================================================
     FILTER
     ======================================================= */

  const filteredFoods =
    currentFoods.filter(
      (food) => {

        const matchesSearch =
          food.name
            .toLowerCase()
            .includes(
              searchTerm
                .toLowerCase()
            );

        const matchesCategory =
          selectedCategory ===
            "All" ||
          food.category ===
            selectedCategory;

        const matchesCalories =
          maxCalories ===
            "all" ||
          food.calories <=
            Number(maxCalories);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesCalories
        );
      }
    );


  /* =======================================================
     SWITCH MODE
     ======================================================= */

  function switchMode() {

    setDietMode(
      !dietMode
    );

    setSearchTerm("");

    setSelectedCategory(
      "All"
    );

    setMaxCalories(
      "all"
    );

    setShowCart(false);
    setShowOrders(false);
  }


  /* =======================================================
     LOGIN PAGE
     ======================================================= */

  if (!loggedIn) {

    return (
      <div className="login-page">

        <div className="login-box">

          <div className="login-logo">
            🍽️
          </div>

          <h1>
            Food Paradise
          </h1>

          <h2>
            {isSignup
              ? "Create Account"
              : "Login"}
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >

            {isSignup && (
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
              />
            )}

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            <button type="submit">
              {isSignup
                ? "Sign Up"
                : "Login"}
            </button>

          </form>

          {message && (
            <p className="error">
              {message}
            </p>
          )}

          <p className="switch-text">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>

          <button
            type="button"
            className="switch-button"
            onClick={() => {

              setIsSignup(
                !isSignup
              );

              setUsername("");
              setEmail("");
              setPassword("");
              setMessage("");

            }}
          >
            {isSignup
              ? "Login"
              : "Sign Up"}
          </button>

        </div>

        <AmmuChatbot
          dietMode={dietMode}
          setDietMode={setDietMode}
          cart={cart}
          cartCalories={cartCalories}
          addToCart={addToCart}
          orders={orders}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          maxCalories={maxCalories}
          setMaxCalories={setMaxCalories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setShowCart={setShowCart}
          setShowOrders={setShowOrders}
          setShowFoodManagement={setShowFoodManagement}
          loggedIn={loggedIn}
          username={username}
          currentFoods={currentFoods}
        />

      </div>
    );
  }


  /* =======================================================
     MAIN APP
     ======================================================= */

  return (
    <div
      className={
        dietMode
          ? "App diet-mode"
          : "App"
      }
    >

      {/* =================================================
          NAVBAR
          ================================================= */}

      <nav>

        <h1>
          {dietMode
            ? "🥗 Healthy Paradise"
            : "🍽️ Food Paradise"}
        </h1>

        <div className="nav-links">

          <button
            type="button"
            className="nav-link-button"
            onClick={() => {
              setShowCart(false);
              setShowOrders(false);
              setShowFoodManagement(false);
              window.scrollTo({
                top: 0,
                behavior:
                  "smooth",
              });

            }}
          >
            Home
          </button>


          <button
            type="button"
            className="nav-link-button"
            onClick={() => {
              setShowCart(false);
              setShowOrders(false);
              setShowFoodManagement(false);

              setTimeout(() => {

                document
                  .getElementById(
                    "food-menu"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  });

              }, 50);

            }}
          >
            Menu
          </button>


          <button
            type="button"
            className="nav-link-button"
            onClick={() => {
              setShowCart(false);
              setShowOrders(false);
              setShowFoodManagement(true);
            }}
          >
            Food Management
          </button>

          <button
            type="button"
            onClick={
              switchMode
            }
          >
            {dietMode
              ? "🍽️ Normal Mode"
              : "🥗 Diet Mode"}
          </button>


          <button
            type="button"
            className="nav-link-button"
            onClick={() => {
              setShowCart(false);
              setShowFoodManagement(false);
              setShowOrders(true);
            }}
          >
            📦 My Orders ({orders.length})
          </button>


          <button
            type="button"
            className="cart-button"
            onClick={() => {
              setShowFoodManagement(false);
              setShowOrders(false);
              setShowCart(!showCart);
            }}
          >
            🛒 Cart (
            {cartCount}
            )
          </button>


          <select
            className="calorie-filter"
            value={maxCalories}
            onChange={(e) => {

              setMaxCalories(
                e.target.value
              );

              setShowCart(false);
              setShowOrders(false);

            }}
          >

            <option value="all">
              🔥 All Calories
            </option>

            <option value="100">
              🔥 Up to 100 kcal
            </option>

            <option value="150">
              🔥 Up to 150 kcal
            </option>

            <option value="200">
              🔥 Up to 200 kcal
            </option>

            <option value="300">
              🔥 Up to 300 kcal
            </option>

            <option value="400">
              🔥 Up to 400 kcal
            </option>

            <option value="500">
              🔥 Up to 500 kcal
            </option>

          </select>


          <button
            type="button"
            className="logout-button"
            onClick={
              logout
            }
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =================================================
          CART PAGE
          ================================================= */}

      {showFoodManagement ? (
        <FoodManagement />
      ) : showOrders ? (

        <section className="cart-section">
          <div className="cart-container">

            <div className="cart-title">
              <h2>📦 My Orders</h2>
              <button
                type="button"
                onClick={() => setShowOrders(false)}
              >
                ← Back to Menu
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="empty-cart">
                <h3>No orders placed yet.</h3>
                <p>Your orders will appear here after checkout.</p>
              </div>
            ) : (
              orders.map(order => (
                <div className="order-card" key={order.orderId}>
                  <h3>{order.orderId}</h3>
                  <p>Order Date: {order.date}</p>
                  <p>Status: Placed</p>

                  <table>
                    <thead>
                      <tr>
                        <th>Food Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={`${item.id}-${index}`}>
                          <td>{item.name}</td>
                          <td>₹{item.price.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="order-total">
                    <p>Subtotal: ₹{order.subtotal.toFixed(2)}</p>
                    <p>CGST (2.5%): ₹{order.cgst.toFixed(2)}</p>
                    <p>SGST (2.5%): ₹{order.sgst.toFixed(2)}</p>
                    <h3>Grand Total: ₹{order.grandTotal.toFixed(2)}</h3>
                  </div>
                </div>
              ))
            )}

          </div>
        </section>

      ) : showCart ? (

        <section className="cart-section">

          <div className="cart-container">

            <div className="cart-title">

              <h2>
                🛒 Your Cart
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowCart(
                    false
                  )
                }
              >
                ← Back to Menu
              </button>

            </div>


            {cart.length === 0 ? (

              <div className="empty-cart">

                <div className="empty-cart-icon">
                  🛒
                </div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add some food
                  from the menu.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowCart(
                      false
                    )
                  }
                >
                  Explore Menu
                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map(
                    (item) => (

                      <div
                        className="cart-item"
                        key={item.id}
                      >

                        <div className="cart-item-info">

                          <h3>
                            {item.name}
                          </h3>

                          <p>
                            {item.category}
                            {" • "}
                            {item.calories}
                            {" kcal"}
                          </p>

                        </div>


                        <div className="quantity-controls">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              addToCart(
                                item
                              )
                            }
                          >
                            +
                          </button>

                        </div>


                        <div className="item-calories">

                          {
                            item.calories *
                            item.quantity
                          }{" "}
                          kcal

                        </div>


                        <button
                          type="button"
                          className="remove-button"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                        >
                          ✕
                        </button>

                      </div>

                    )
                  )}

                </div>


                <OrderSection
                  cart={cart}
                  orders={orders}
                  onOrderComplete={handleOrderComplete}
                />
              </>

            )}

          </div>

        </section>

      ) : (

        <>

          {/* =================================================
              HERO
              ================================================= */}

          <section
            className="hero-section"
            style={{
              backgroundImage:
                dietMode
                  ? `linear-gradient(
                      rgba(0, 0, 0, 0.45),
                      rgba(0, 0, 0, 0.45)
                    ), url("${healthyImage}")`
                  : `linear-gradient(
                      rgba(0, 0, 0, 0.45),
                      rgba(0, 0, 0, 0.45)
                    ), url("${backgroundImage}")`,
            }}
          >

            <div className="hero-content">

              <h2>
                {dietMode
                  ? "Healthy Choices for You 🥗"
                  : "Welcome to Food Paradise 🍽️"}
              </h2>

              <p>
                {dietMode
                  ? "100 healthy vegetarian choices with 200 calories or less per listed serving."
                  : "100 vegetarian and non-vegetarian choices from 250 to 500 calories per listed serving."}
              </p>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "food-menu"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
              >
                {dietMode
                  ? "Explore Healthy Menu"
                  : "Explore Menu"}
              </button>

            </div>

          </section>


          {/* =================================================
              MENU
              ================================================= */}

          <section
            className="food-menu"
            id="food-menu"
          >

            <div className="menu-heading">

              <span className="menu-icon">
                {dietMode
                  ? "🥗"
                  : "🍽️"}
              </span>

              <h2>
                {dietMode
                  ? "Healthy Diet Menu"
                  : "Food Paradise Menu"}
              </h2>

              <p>
                {dietMode
                  ? "100 healthy vegetarian choices, each 200 kcal or less per listed serving."
                  : "100 vegetarian and non-vegetarian choices between 250 and 500 kcal per listed serving."}
              </p>

            </div>


            <div className="food-controls">

              <input
                type="text"
                placeholder={
                  dietMode
                    ? "🔎 Search healthy food..."
                    : "🔎 Search food..."
                }
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />


              <select
                value={
                  selectedCategory
                }
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
              >

                {categories.map(
                  (category) => (

                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="active-filter">

              <span>
                Showing{" "}
                {
                  filteredFoods.length
                }{" "}
                of{" "}
                {
                  currentFoods.length
                }{" "}
                items
              </span>

              {maxCalories !==
                "all" && (
                <span>
                  🔥 Maximum{" "}
                  {maxCalories}{" "}
                  kcal
                </span>
              )}

            </div>


            <div className="food-grid">

              {filteredFoods.map(
                (food) => {

                  const quantity =
                    getCartQuantity(
                      food.id
                    );

                  return (

                    <div
                      className="food-card"
                      key={food.id}
                    >

                      <div className="food-number">
  #
  {filteredFoods.findIndex(
    (item) => item.id === food.id
  ) + 1}
</div>

                      <div className="food-card-header">

                        <h3>
                          {food.name}
                        </h3>

                        <span className="calorie-badge">
                          🔥{" "}
                          {
                            food.calories
                          }{" "}
                          kcal
                        </span>

                      </div>


                      <p className="food-category">
                        {
                          food.category
                        }
                      </p>
                      {food.price !== undefined && (
  <p className="food-price">
    <strong>Price:</strong> ₹
    {Number(food.price).toLocaleString("en-IN")}
  </p>
)}


                     <div className="food-info">
  <p>
    <strong>Serving:</strong>{" "}
    {food.serving || "1 serving"}
  </p>

  <p>
    <strong>Protein:</strong>{" "}
    {food.protein || "Not specified"}
  </p>

  <p>
    <strong>Ingredients:</strong>{" "}
    {food.ingredients || "See food details"}
  </p>
</div>


                      {quantity === 0 ? (

                        <button
                          type="button"
                          className="add-cart-button"
                          onClick={() =>
                            addToCart(
                              food
                            )
                          }
                        >
                          ➕ Add to Cart
                        </button>

                      ) : (

                        <div className="food-cart-control">

                          <div className="food-quantity-controls">

                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  food.id
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                addToCart(
                                  food
                                )
                              }
                            >
                              +
                            </button>

                          </div>

                          <p className="added-message">

                            ✅{" "}
                            {quantity}{" "}
                            {quantity === 1
                              ? "item"
                              : "items"}{" "}
                            added to cart

                          </p>

                        </div>

                      )}

                    </div>

                  );
                }
              )}

            </div>


            {filteredFoods.length ===
              0 && (

              <div className="no-results">

                <h3>
                  😕 No food found
                </h3>

                <p>
                  No items match your
                  selected filters.
                </p>

                <button
                  type="button"
                  onClick={() => {

                    setSearchTerm("");

                    setSelectedCategory(
                      "All"
                    );

                    setMaxCalories(
                      "all"
                    );

                  }}
                >
                  Clear Filters
                </button>

              </div>

            )}

          </section>

        </>

      )}

      {/* =================================================
          AMMU CHATBOT
          ================================================= */}
      <AmmuChatbot
        dietMode={dietMode}
        setDietMode={setDietMode}
        cart={cart}
        cartCalories={cartCalories}
        addToCart={addToCart}
        orders={orders}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        maxCalories={maxCalories}
        setMaxCalories={setMaxCalories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setShowCart={setShowCart}
        setShowOrders={setShowOrders}
        setShowFoodManagement={setShowFoodManagement}
        loggedIn={loggedIn}
        username={username}
        currentFoods={currentFoods}
      />

    </div>
  );
}

export default App;