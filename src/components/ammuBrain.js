import { allFoods, dietFoods, normalFoods, getFoodPrice } from "../data/foodData";

// Friendly Ammu greetings and emojis
const AMMU_EMOJIS = ["👩‍🍳", "🍲", "🥗", "✨", "😋", "💛", "🍽️", "🌿"];

export function getRandomEmoji() {
  return AMMU_EMOJIS[Math.floor(Math.random() * AMMU_EMOJIS.length)];
}

// Quick action chips for customer
export const DEFAULT_QUICK_ACTIONS = [
  { id: "menu", label: "📋 Show Today's Menu", query: "Show me the menu" },
  { id: "quiz", label: "🎯 Help Me Choose", query: "Help me choose what to eat" },
  { id: "diet", label: "🥗 Healthy / Diet Mode", query: "Show healthy diet food" },
  { id: "nonveg", label: "🍗 Non-Veg Specials", query: "Show non-veg specials" },
  { id: "protein", label: "💪 High Protein Picks", query: "Show high protein meals" },
  { id: "budget", label: "💰 Budget Eats (under ₹100)", query: "Food under 100 rupees" },
  { id: "cart", label: "🛒 What's in my cart?", query: "What is in my cart?" },
];

export const PREFERENCE_QUESTIONS = {
  diet: {
    question: "First things first! What kind of food are you in the mood for? 🍽️",
    options: [
      { label: "🥦 Pure Vegetarian", value: "veg" },
      { label: "🍗 Non-Vegetarian", value: "nonveg" },
      { label: "🥗 Healthy / Diet Focus", value: "diet" },
      { label: "✨ Anything Delicious!", value: "any" },
    ],
  },
  meal: {
    question: "Awesome! Which meal is this for? ⏰",
    options: [
      { label: "🥞 Breakfast / Morning Start", value: "breakfast" },
      { label: "🍛 Hearty Lunch or Dinner", value: "main" },
      { label: "🥪 Quick Snacks", value: "snack" },
      { label: "🥤 Drinks & Beverages", value: "drink" },
    ],
  },
  goal: {
    question: "And what matters most to you right now? 🎯",
    options: [
      { label: "💪 High Protein Power", value: "protein" },
      { label: "🔥 Low Calorie (< 200 kcal)", value: "lowcal" },
      { label: "💰 Budget Friendly (< ₹100)", value: "budget" },
      { label: "😋 Chef's Top Rated / Comfort Food", value: "comfort" },
    ],
  },
};

/**
 * Searches the full food catalog for matching items
 */
export function searchCatalog(query, catalog = allFoods) {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  return catalog
    .map((food) => {
      const name = food.name.toLowerCase();
      const cat = (food.category || "").toLowerCase();
      const ing = (food.ingredients || "").toLowerCase();

      let score = 0;
      if (name === clean) score += 100;
      else if (name.startsWith(clean)) score += 50;
      else if (name.includes(clean)) score += 30;

      if (cat === clean) score += 40;
      else if (cat.includes(clean)) score += 20;

      if (ing.includes(clean)) score += 10;

      return { food, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.food);
}

/**
 * Main intent analysis & response generator for Ammu
 */
export function generateAmmuResponse(userMessage, context = {}) {
  const text = (userMessage || "").trim().toLowerCase();
  const {
    dietMode = false,
    setDietMode,
    cart = [],
    addToCart,
    orders = [],
    setSelectedCategory,
    setSearchTerm,
    setMaxCalories,
    setShowCart,
    setShowOrders,
    preferenceState = null,
    setPreferenceState,
    currentFoods = allFoods,
  } = context;

  // Active Catalog based on current mode
  const activeCatalog = dietMode ? dietFoods : normalFoods;

  // Helper to format food cards
  const formatCards = (foods, limit = 4) => {
    return foods.slice(0, limit).map((f) => ({
      ...f,
      price: getFoodPrice(f),
    }));
  };

  // ---------------------------------------------------------------
  // 1. PREFERENCE QUIZ FLOW (Interactive Step-by-Step)
  // ---------------------------------------------------------------
  if (
    text.includes("help me choose") ||
    text.includes("preference") ||
    text.includes("recommend for me") ||
    text.includes("what should i eat") ||
    text.includes("confused") ||
    text === "quiz"
  ) {
    if (setPreferenceState) {
      setPreferenceState({ step: "diet", answers: {} });
    }
    return {
      text: "I would LOVE to help you choose the perfect meal! 👩‍🍳✨ Let me ask you 3 quick questions to find your dream dish. \n\nFirst, what kind of food are you craving?",
      chips: PREFERENCE_QUESTIONS.diet.options.map((opt) => ({
        label: opt.label,
        action: `pref_diet_${opt.value}`,
      })),
      preferenceStep: "diet",
    };
  }

  // Handle active preference questionnaire steps
  if (preferenceState && preferenceState.step) {
    const { step, answers = {} } = preferenceState;

    if (step === "diet") {
      let chosenDiet = "any";
      if (text.includes("veg") && !text.includes("non")) chosenDiet = "veg";
      else if (text.includes("non") || text.includes("chicken") || text.includes("meat")) chosenDiet = "nonveg";
      else if (text.includes("diet") || text.includes("healthy")) chosenDiet = "diet";

      const updatedAnswers = { ...answers, diet: chosenDiet };
      if (setPreferenceState) {
        setPreferenceState({ step: "meal", answers: updatedAnswers });
      }
      return {
        text: "Got it! And what time of day or type of meal is this? 🌅🍛",
        chips: PREFERENCE_QUESTIONS.meal.options.map((opt) => ({
          label: opt.label,
          action: `pref_meal_${opt.value}`,
        })),
        preferenceStep: "meal",
      };
    }

    if (step === "meal") {
      let chosenMeal = "main";
      if (text.includes("breakfast") || text.includes("morning")) chosenMeal = "breakfast";
      else if (text.includes("snack")) chosenMeal = "snack";
      else if (text.includes("drink") || text.includes("juice") || text.includes("beverage")) chosenMeal = "drink";

      const updatedAnswers = { ...answers, meal: chosenMeal };
      if (setPreferenceState) {
        setPreferenceState({ step: "goal", answers: updatedAnswers });
      }
      return {
        text: "Almost there! What's the main priority for this meal? 🎯",
        chips: PREFERENCE_QUESTIONS.goal.options.map((opt) => ({
          label: opt.label,
          action: `pref_goal_${opt.value}`,
        })),
        preferenceStep: "goal",
      };
    }

    if (step === "goal") {
      let chosenGoal = "comfort";
      if (text.includes("protein") || text.includes("muscle") || text.includes("gym")) chosenGoal = "protein";
      else if (text.includes("low") || text.includes("cal") || text.includes("light")) chosenGoal = "lowcal";
      else if (text.includes("budget") || text.includes("100") || text.includes("cheap")) chosenGoal = "budget";

      const finalAnswers = { ...answers, goal: chosenGoal };
      if (setPreferenceState) {
        setPreferenceState(null); // Finish quiz
      }

      // Filter catalog by finalAnswers
      let pool = [...allFoods];

      if (finalAnswers.diet === "veg") {
        pool = pool.filter(
          (f) =>
            f.category !== "Chicken" &&
            f.category !== "Fish & Seafood" &&
            f.category !== "Egg" &&
            !f.name.toLowerCase().includes("chicken") &&
            !f.name.toLowerCase().includes("fish") &&
            !f.name.toLowerCase().includes("egg") &&
            !f.name.toLowerCase().includes("prawn")
        );
      } else if (finalAnswers.diet === "nonveg") {
        pool = pool.filter(
          (f) =>
            f.category === "Chicken" ||
            f.category === "Fish & Seafood" ||
            f.category === "Egg" ||
            f.name.toLowerCase().includes("chicken") ||
            f.name.toLowerCase().includes("biryani")
        );
      } else if (finalAnswers.diet === "diet") {
        pool = dietFoods;
      }

      if (finalAnswers.meal === "breakfast") {
        pool = pool.filter(
          (f) =>
            f.category === "Breakfast" ||
            f.category === "South Indian" ||
            f.category === "Egg" ||
            f.name.includes("Dosa") ||
            f.name.includes("Idli") ||
            f.name.includes("Upma") ||
            f.name.includes("Omelette")
        );
      } else if (finalAnswers.meal === "snack") {
        pool = pool.filter(
          (f) =>
            f.category === "Snacks" ||
            f.category === "Fast Food" ||
            f.name.includes("Sandwich") ||
            f.name.includes("Roll") ||
            f.name.includes("Cutlet")
        );
      } else if (finalAnswers.meal === "drink") {
        pool = pool.filter(
          (f) =>
            f.category === "Drinks" ||
            f.category === "Fruits" ||
            f.name.includes("Juice") ||
            f.name.includes("Water") ||
            f.name.includes("Smoothie")
        );
      } else if (finalAnswers.meal === "main") {
        pool = pool.filter(
          (f) =>
            f.category === "Rice & Meals" ||
            f.category === "North Indian" ||
            f.category === "Chicken" ||
            f.category === "Fish & Seafood" ||
            f.category === "Vegetarian" ||
            f.category === "Light Meals"
        );
      }

      if (finalAnswers.goal === "protein") {
        pool.sort((a, b) => {
          const pa = parseFloat(a.protein) || 0;
          const pb = parseFloat(b.protein) || 0;
          return pb - pa;
        });
      } else if (finalAnswers.goal === "lowcal") {
        pool = pool.filter((f) => f.calories <= 250);
        pool.sort((a, b) => a.calories - b.calories);
      } else if (finalAnswers.goal === "budget") {
        pool = pool.filter((f) => getFoodPrice(f) <= 120);
        pool.sort((a, b) => getFoodPrice(a) - getFoodPrice(b));
      }

      const results = pool.slice(0, 4);

      if (results.length === 0) {
        return {
          text: "You have very unique taste! While I couldn't find an exact match for all three filters, here are some of my personal favorite dishes you will truly enjoy 😋:",
          foodCards: formatCards(activeCatalog.slice(0, 4)),
        };
      }

      return {
        text: `Tada! 🎉 Based on your preferences, Ammu handpicked these fantastic dishes for you! They fit your taste, meal timing, and priority like a glove. Tap **+ Add to Cart** on any you like!`,
        foodCards: formatCards(results),
        chips: [
          { label: "🔄 Help Me Choose Again", query: "Help me choose" },
          { label: "📋 Show Full Menu", query: "Show me the menu" },
          { label: "🛒 View My Cart", query: "What is in my cart?" },
        ],
      };
    }
  }

  // ---------------------------------------------------------------
  // 2. GREETINGS & INTRODUCTIONS
  // ---------------------------------------------------------------
  if (
    /^(hi|hello|hey|vanakkam|namaste|good morning|good evening|good afternoon|sup|yo|ammu|hoi)/i.test(
      text
    ) ||
    text === "who are you" ||
    text === "what is your name" ||
    text.includes("introduce yourself")
  ) {
    return {
      text: "Vanakkam & Hello there! I'm Ammu, your friendly foodie companion at Food Paradise! 👩‍🍳✨\n\nI can tell you about our menu, take your taste & dietary preferences, recommend low-calorie or high-protein meals, and even add dishes directly to your cart! \n\nHow can I delight your tastebuds today? 😊",
      chips: DEFAULT_QUICK_ACTIONS,
    };
  }

  // ---------------------------------------------------------------
  // 3. EXPLICIT ACTION: ADD TO CART VIA TEXT COMMAND
  // ---------------------------------------------------------------
  if (
    text.startsWith("add ") &&
    (text.includes("to cart") || text.includes("to my cart"))
  ) {
    const cleanItemName = text
      .replace(/^add\s+/, "")
      .replace(/\s+to\s+(my\s+)?cart.*$/, "")
      .trim();

    const matches = searchCatalog(
      cleanItemName,
      currentFoods.length ? currentFoods : allFoods
    );
    if (matches.length > 0) {
      const foodItem = { ...matches[0], price: getFoodPrice(matches[0]) };
      if (addToCart) addToCart(foodItem);
      return {
        text: `Yay! I've added **${foodItem.name}** (₹${foodItem.price}) right into your cart! 🛒 Anything else you'd like to enjoy?`,
        chips: [
          { label: "🛒 View My Cart", query: "What is in my cart?" },
          { label: "🥤 Add a Drink", query: "Show drinks" },
          { label: "📋 Full Menu", query: "Show me the menu" },
        ],
      };
    }
  }

  // ---------------------------------------------------------------
  // 4. INGREDIENTS & RECIPE QUESTIONS (High precedence)
  // ---------------------------------------------------------------
  if (
    text.includes("ingredient") ||
    text.includes("made of") ||
    text.includes("recipe") ||
    text.includes("what is in")
  ) {
    const cleanQuery = text
      .replace(/ingredients?\s+(of|for|in)?/gi, "")
      .replace(/what is in/gi, "")
      .replace(/what are the ingredients of/gi, "")
      .replace(/recipe\s+of/gi, "")
      .trim();

    const searchPool = currentFoods.length ? currentFoods : allFoods;
    const matches = searchCatalog(cleanQuery, searchPool);
    if (matches.length > 0) {
      const topMatch = matches[0];
      return {
        text: `Here are the ingredients for **${topMatch.name}** 👨‍🍳:\n\n🥗 **Ingredients:** ${topMatch.ingredients}\n🔥 **Calories:** ${topMatch.calories} kcal\n💪 **Protein:** ${topMatch.protein}\n🍽️ **Serving Size:** ${topMatch.serving}\n💰 **Price:** ₹${getFoodPrice(topMatch)}\n\nPrepared fresh to order in our clean kitchen! Would you like to add it?`,
        foodCards: formatCards([topMatch]),
        chips: [
          { label: `+ Add ${topMatch.name}`, action: `add_food_${topMatch.id}` },
          { label: "📋 Full Menu", query: "Show me the menu" },
        ],
      };
    }
  }

  // ---------------------------------------------------------------
  // 5. BUDGET & PRICE QUERIES (High precedence before calorie)
  // ---------------------------------------------------------------
  const isBudgetQuery =
    text.includes("rupee") ||
    text.includes("rs") ||
    text.includes("₹") ||
    text.includes("cheap") ||
    text.includes("budget") ||
    text.includes("affordable") ||
    text.includes("low price") ||
    text.includes("price under") ||
    text.includes("cost under") ||
    (text.includes("under 100") && !text.includes("cal")) ||
    (text.includes("under 50") && !text.includes("cal"));

  if (isBudgetQuery) {
    const budgetLimit = text.includes("50") ? 50 : 100;
    const budgetPool = allFoods
      .filter((f) => getFoodPrice(f) <= budgetLimit)
      .sort((a, b) => getFoodPrice(a) - getFoodPrice(b));

    const picks = budgetPool.slice(0, 4);

    return {
      text: `Pocket-friendly feast incoming! 💰 Delicious food doesn't have to break the bank. Here are our best picks **under ₹${budgetLimit}**:\n\n` +
        picks
          .map(
            (f) =>
              `• **${f.name}** — **₹${getFoodPrice(f)}** | 🔥 ${f.calories} kcal`
          )
          .join("\n") +
        "\n\nWhich one would you like to savor?",
      foodCards: formatCards(picks),
      chips: [
        { label: "🥞 Budget Breakfast", query: "Budget breakfast" },
        { label: "🥪 Budget Snacks", query: "Budget snacks" },
        { label: "🥤 Drinks under ₹50", query: "Drinks under 50" },
      ],
    };
  }

  // ---------------------------------------------------------------
  // 6. CART & BILLING INQUIRIES
  // ---------------------------------------------------------------
  if (
    text === "cart" ||
    text.includes("what is in my cart") ||
    text.includes("what's in my cart") ||
    text.includes("my cart") ||
    text.includes("check cart") ||
    text.includes("total") ||
    text.includes("bill") ||
    text.includes("checkout")
  ) {
    if (!cart || cart.length === 0) {
      return {
        text: "Your cart is currently empty! 🛒 A happy tummy starts with a full cart. Would you like me to recommend our most popular specialties?",
        chips: [
          { label: "🍗 Chicken Biryani", query: "Chicken Biryani" },
          { label: "🥞 Masala Dosa", query: "Masala Dosa" },
          { label: "🥗 Healthy Diet Menu", query: "Show healthy diet food" },
          { label: "📋 Show Menu", query: "Show me the menu" },
        ],
      };
    }

    const subtotal = cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
      0
    );
    const totalCalories = cart.reduce(
      (sum, item) => sum + Number(item.calories || 0) * (item.quantity || 1),
      0
    );
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const grandTotal = subtotal + cgst + sgst;

    const itemsSummary = cart
      .map(
        (item) =>
          `• **${item.name}** × ${item.quantity} (₹${(
            Number(item.price) * item.quantity
          ).toFixed(2)}) - ${Number(item.calories) * item.quantity} kcal`
      )
      .join("\n");

    return {
      text: `Here is what's in your cart right now 🛒:\n\n${itemsSummary}\n\n**Subtotal:** ₹${subtotal.toFixed(
        2
      )}\n**CGST (2.5%):** ₹${cgst.toFixed(2)}\n**SGST (2.5%):** ₹${sgst.toFixed(
        2
      )}\n**Grand Total:** ₹${grandTotal.toFixed(
        2
      )}\n🔥 **Total Calories:** ${totalCalories} kcal\n\nEverything looks scrumptious! Would you like to proceed to checkout?`,
      chips: [
        {
          label: "🛍️ Go to Cart & Checkout",
          action: "open_cart",
        },
        { label: "🍽️ Add More Food", query: "Show me the menu" },
      ],
    };
  }

  // ---------------------------------------------------------------
  // 7. APP ACTION COMMANDS (Mode switch, Go to Cart, Go to Orders, Search)
  // ---------------------------------------------------------------
  if (text.startsWith("search ") || text.startsWith("find ")) {
    const searchTermExtracted = text.replace(/^(search|find)\s+/, "").trim();
    if (setSearchTerm) setSearchTerm(searchTermExtracted);
  }

  if (
    text.includes("switch to diet") ||
    text.includes("turn on diet") ||
    text.includes("enable diet")
  ) {
    if (setDietMode) setDietMode(true);
    return {
      text: "Voila! 🥗 I've switched your app to **Diet Mode**! Now you can explore our 100 wholesome, low-calorie, healthy vegetarian dishes like fresh salads, protein-rich sprouts, and nourishing soups. What healthy treat shall we start with?",
      foodCards: formatCards(dietFoods.slice(0, 4)),
      chips: [
        { label: "🥗 Fresh Salads", query: "Show salads" },
        { label: "🌱 Protein Sprouts", query: "Show sprouts" },
        { label: "🥣 Warm Soups", query: "Show soup" },
        { label: "🍽️ Switch to Normal Mode", query: "Switch to normal mode" },
      ],
    };
  }

  if (
    text.includes("switch to normal") ||
    text.includes("turn off diet") ||
    text.includes("disable diet")
  ) {
    if (setDietMode) setDietMode(false);
    return {
      text: "Done! 🍽️ I've switched you back to **Normal Mode**! Get ready for flavorful Biryanis, crispy Dosas, hot Pizzas, curries, and tikkas! What are you craving?",
      foodCards: formatCards(normalFoods.slice(0, 4)),
      chips: [
        { label: "🍗 Chicken Specials", query: "Chicken" },
        { label: "🍛 Biryani Lovers", query: "Biryani" },
        { label: "🥞 South Indian", query: "South Indian" },
        { label: "🍕 Pizzas & Fast Food", query: "Fast food" },
      ],
    };
  }

  if (
    text === "open_cart" ||
    text.includes("go to cart") ||
    text.includes("open cart") ||
    text.includes("show cart")
  ) {
    if (setShowCart) setShowCart(true);
    if (setShowOrders) setShowOrders(false);
    return {
      text: "Opening your cart now! 🛒 You can review your dishes, quantity, and tap Proceed to order! Let me know if you need anything else! 😋",
    };
  }

  if (
    text.includes("show orders") ||
    text.includes("my orders") ||
    text.includes("past orders") ||
    text.includes("order history")
  ) {
    if (setShowOrders) setShowOrders(true);
    if (setShowCart) setShowCart(false);
    return {
      text: `Opening your order history! 📦 You have placed ${orders.length} order(s) so far. Thank you for choosing Food Paradise! ✨`,
    };
  }

  // ---------------------------------------------------------------
  // 8. HIGH PROTEIN REQUESTS
  // ---------------------------------------------------------------
  if (
    text.includes("protein") ||
    text.includes("gym") ||
    text.includes("muscle") ||
    text.includes("workout")
  ) {
    const isVegOnly =
      text.includes("veg") && !text.includes("non") ? true : false;

    let proteinPool = isVegOnly
      ? allFoods.filter(
          (f) =>
            f.category !== "Chicken" &&
            f.category !== "Fish & Seafood" &&
            f.category !== "Egg" &&
            !f.name.toLowerCase().includes("chicken") &&
            !f.name.toLowerCase().includes("fish") &&
            !f.name.toLowerCase().includes("egg")
        )
      : allFoods;

    const sortedProtein = [...proteinPool].sort((a, b) => {
      const pa = parseFloat(a.protein) || 0;
      const pb = parseFloat(b.protein) || 0;
      return pb - pa;
    });

    const topPicks = sortedProtein.slice(0, 4);

    return {
      text: `Fitness champions, assemble! 💪 Here are our top high-protein powerhouse dishes ${
        isVegOnly ? "(100% Vegetarian)" : ""
      }:\n\n` +
        topPicks
          .map(
            (f) =>
              `• **${f.name}** — **${f.protein} protein** | ${f.calories} kcal | ₹${getFoodPrice(
                f
              )}`
          )
          .join("\n") +
        "\n\nWould you like me to add one of these protein boosters to your cart?",
      foodCards: formatCards(topPicks),
      chips: [
        { label: "🥦 Veg High Protein", query: "Vegetarian high protein" },
        { label: "🍗 Non-Veg High Protein", query: "Non veg high protein" },
        { label: "🔥 Low Calorie High Protein", query: "Low calorie high protein" },
      ],
    };
  }

  // ---------------------------------------------------------------
  // 9. LOW CALORIE & DIET QUERIES
  // ---------------------------------------------------------------
  if (
    text.includes("low calorie") ||
    text.includes("low cal") ||
    text.includes("least calorie") ||
    text.includes("lowest calorie") ||
    text.includes("calorie") ||
    text.includes("cal") ||
    text.includes("diet food") ||
    text.includes("weight loss")
  ) {
    let maxLimit = 200;
    if (text.includes("100")) maxLimit = 100;
    else if (text.includes("150")) maxLimit = 150;

    if (setMaxCalories && (text.includes("filter") || text.includes("set"))) {
      setMaxCalories(String(maxLimit));
    }

    const lowCalPool = allFoods
      .filter((f) => f.calories <= maxLimit)
      .sort((a, b) => a.calories - b.calories);

    const picks = lowCalPool.slice(0, 4);

    return {
      text: `Watching those calories? Ammu's got your back! 🥗 Here are delicious, guilt-free treats with **${maxLimit} kcal or fewer**:\n\n` +
        picks
          .map(
            (f) =>
              `• **${f.name}** — 🔥 **${f.calories} kcal** | ₹${getFoodPrice(
                f
              )} (${f.category})`
          )
          .join("\n") +
        "\n\nHealthy eating can still be super delicious! 😋",
      foodCards: formatCards(picks),
      chips: [
        { label: "🥗 Fresh Salads", query: "Show salads" },
        { label: "🥤 Healthy Drinks", query: "Show healthy drinks" },
        { label: "🥣 Light Meals", query: "Show light meals" },
      ],
    };
  }

  // ---------------------------------------------------------------
  // 10. TELLING THE MENU & CATEGORIES
  // ---------------------------------------------------------------
  if (
    text.includes("menu") ||
    text.includes("what do you have") ||
    text.includes("what do you serve") ||
    text.includes("food list") ||
    text.includes("categories") ||
    text.includes("what food")
  ) {
    if (dietMode) {
      return {
        text: `Here is our fresh **Healthy & Diet Menu**! 🥗\nWe feature 100 nutritious vegetarian recipes across these categories:\n\n• 🥞 **Breakfast**: Idli, Ragi Idli, Vegetable Poha, Moong Dal Chilla\n• 🥗 **Salads**: Sprouted Moong Salad, Apple Cucumber, Chickpea Salad\n• 🌱 **Sprouts & Legumes**: Boiled Chickpeas, Black Chana, Mixed Sprouts\n• 🍎 **Fresh Fruits**: Kiwi, Strawberries, Watermelon, Mango, Papaya\n• 🥦 **Steamed Veggies**: Broccoli, Spinach Stir Fry, Pumpkin Curry\n• 🥤 **Drinks**: Fresh Buttermilk, Coconut Water, Mint Lemon Water\n• 🥣 **Light Meals & Soups**: Veg Khichdi, Moong Dal Soup, Lentil Bowl\n\nWhat kind of healthy dish are you craving?`,
        foodCards: formatCards(dietFoods.slice(0, 4)),
        chips: [
          { label: "🥞 Breakfast", query: "Show diet breakfast" },
          { label: "🥗 Salads", query: "Show salads" },
          { label: "🥣 Soups", query: "Show soups" },
          { label: "🥤 Drinks", query: "Show drinks" },
          { label: "🍽️ Switch to Normal Menu", query: "Switch to normal mode" },
        ],
      };
    } else {
      return {
        text: `Welcome to our **Food Paradise Menu**! 🍽️✨\nWe have over 100 lip-smacking dishes across all your favorite cuisines:\n\n• 🥞 **South Indian**: Masala Dosa, Ghee Roast, Paneer Dosa, Pongal\n• 🫓 **North Indian**: Paneer Paratha, Chole Bhature, Rajma Rice\n• 🍛 **Rice & Biryanis**: Chicken Biryani, Paneer Biryani, Veg Biryani\n• 🍕 **Fast Food**: Veg & Chicken Pizza, Burgers, Schezwan Noodles\n• 🍲 **Vegetarian Curries**: Paneer Butter Masala, Kadai Paneer, Dal Makhani\n• 🍗 **Chicken & Seafood**: Grilled Chicken, Chicken Tikka, Fish Fry, Prawn Curry\n• 🍳 **Egg Specials**: Masala Omelette, Egg Curry, Chicken Egg Roll\n\nTell me what you're craving, or tap a category below! 👇`,
        foodCards: formatCards(normalFoods.slice(0, 4)),
        chips: [
          { label: "🍛 Biryani Specials", query: "Biryani" },
          { label: "🥞 South Indian Dosa", query: "Dosa" },
          { label: "🍗 Chicken Dishes", query: "Chicken" },
          { label: "🍕 Pizzas & Fast Food", query: "Pizza" },
          { label: "🥗 View Healthy Diet Menu", query: "Switch to diet mode" },
        ],
      };
    }
  }

  // ---------------------------------------------------------------
  // 11. SPECIFIC CATEGORY QUERIES
  // ---------------------------------------------------------------
  const categoryKeywords = [
    { key: "biryani", name: "Biryani", filter: (f) => f.name.toLowerCase().includes("biryani") },
    { key: "dosa", name: "Dosas", filter: (f) => f.name.toLowerCase().includes("dosa") },
    { key: "idli", name: "Idlis", filter: (f) => f.name.toLowerCase().includes("idli") },
    { key: "pizza", name: "Pizzas", filter: (f) => f.name.toLowerCase().includes("pizza") },
    { key: "burger", name: "Burgers", filter: (f) => f.name.toLowerCase().includes("burger") },
    { key: "noodle", name: "Noodles", filter: (f) => f.name.toLowerCase().includes("noodle") },
    { key: "salad", name: "Salads", filter: (f) => f.category === "Salads" || f.name.toLowerCase().includes("salad") },
    { key: "soup", name: "Soups", filter: (f) => f.name.toLowerCase().includes("soup") },
    { key: "chicken", name: "Chicken Specialties", filter: (f) => f.category === "Chicken" || f.name.toLowerCase().includes("chicken") },
    { key: "fish", name: "Fish & Seafood", filter: (f) => f.category === "Fish & Seafood" || f.name.toLowerCase().includes("fish") || f.name.toLowerCase().includes("prawn") },
    { key: "seafood", name: "Fish & Seafood", filter: (f) => f.category === "Fish & Seafood" || f.name.toLowerCase().includes("prawn") },
    { key: "prawn", name: "Prawn Dishes", filter: (f) => f.name.toLowerCase().includes("prawn") },
    { key: "paneer", name: "Paneer Specials", filter: (f) => f.name.toLowerCase().includes("paneer") },
    { key: "egg", name: "Egg Delights", filter: (f) => f.category === "Egg" || f.name.toLowerCase().includes("egg") || f.name.toLowerCase().includes("omelette") },
    { key: "drink", name: "Beverages & Drinks", filter: (f) => f.category === "Drinks" || f.name.toLowerCase().includes("water") || f.name.toLowerCase().includes("juice") || f.name.toLowerCase().includes("smoothie") },
    { key: "juice", name: "Juices & Smoothies", filter: (f) => f.name.toLowerCase().includes("juice") || f.name.toLowerCase().includes("smoothie") },
    { key: "breakfast", name: "Breakfast Items", filter: (f) => f.category === "Breakfast" || f.category === "South Indian" },
    { key: "snack", name: "Snacks", filter: (f) => f.category === "Snacks" },
  ];

  for (const cat of categoryKeywords) {
    if (text.includes(cat.key)) {
      if (setSelectedCategory && (text.includes("filter") || text.includes("category"))) {
        setSelectedCategory(cat.name);
      }
      const matches = allFoods.filter(cat.filter);
      if (matches.length > 0) {
        return {
          text: `Here are our lip-smacking **${cat.name}**! 😋 Which one catches your eye?`,
          foodCards: formatCards(matches, 5),
          chips: [
            { label: "🛒 View My Cart", query: "What is in my cart?" },
            { label: "📋 Full Menu", query: "Show me the menu" },
          ],
        };
      }
    }
  }

  // ---------------------------------------------------------------
  // 12. SPECIFIC FOOD SEARCH
  // ---------------------------------------------------------------
  const searchPool = currentFoods && currentFoods.length > 0 ? currentFoods : allFoods;
  const searchResults = searchCatalog(text, searchPool);
  if (searchResults.length > 0) {
    const topMatch = searchResults[0];

    return {
      text: `Look what I found for you! ✨ **${topMatch.name}** is a customer favorite! Here are the details and matching options:`,
      foodCards: formatCards(searchResults, 4),
      chips: [
        { label: `+ Add ${topMatch.name}`, action: `add_food_${topMatch.id}` },
        { label: "📋 Full Menu", query: "Show me the menu" },
        { label: "🛒 Check Cart", query: "What is in my cart?" },
      ],
    };
  }

  // ---------------------------------------------------------------
  // 13. RESTAURANT FAQS & INFORMATION
  // ---------------------------------------------------------------
  if (
    text.includes("timing") ||
    text.includes("hours") ||
    text.includes("open") ||
    text.includes("close")
  ) {
    return {
      text: "Food Paradise is open every day from **7:00 AM to 11:00 PM**! ☀️🌙 Breakfast is served from 7:00 AM, lunch starts at 12:00 PM, and dinner goes right up until closing. We can't wait to serve you!",
      chips: DEFAULT_QUICK_ACTIONS.slice(0, 3),
    };
  }

  if (text.includes("tax") || text.includes("gst")) {
    return {
      text: "Our billing is crystal clear! We apply standard government GST: **2.5% CGST + 2.5% SGST (5% total)** on all food orders. It is itemized right in your cart summary so there are no surprises! 😊",
      chips: [{ label: "🛒 Check Cart", query: "What is in my cart?" }],
    };
  }

  if (text.includes("contact") || text.includes("phone") || text.includes("address") || text.includes("location")) {
    return {
      text: "You can find Food Paradise right in the heart of town! 📍 For support or custom catering inquiries, reach us at **support@foodparadise.com** or call our hotline. But remember, I'm right here 24/7 to help you with your order! 💛",
    };
  }

  if (text.includes("thank") || text.includes("awesome") || text.includes("good job") || text.includes("love you")) {
    return {
      text: "Awww, thank you so much! You're making me blush! 🙈💖 Serving hungry foodies like you is the best part of my day. Enjoy every single bite of your food!",
      chips: [{ label: "🛒 View My Cart", query: "What is in my cart?" }],
    };
  }

  // ---------------------------------------------------------------
  // 14. FRIENDLY FALLBACK WITH RECOMMENDATIONS
  // ---------------------------------------------------------------
  return {
    text: `I'm not quite sure about that one, but I'm always eager to help! 😊 Would you like to explore our popular dishes, tell me your food preferences, or check out our healthy Diet Mode?`,
    foodCards: formatCards(activeCatalog.slice(0, 3)),
    chips: DEFAULT_QUICK_ACTIONS,
  };
}
