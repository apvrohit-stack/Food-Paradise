import { generateAmmuResponse } from "./ammuBrain";
import { allFoods } from "../data/foodData";

describe("Ammu Chatbot Brain Tests", () => {
  test("responds to greetings warmly with name Ammu", () => {
    const res = generateAmmuResponse("Hi Ammu");
    expect(res.text).toMatch(/Ammu/i);
    expect(res.text).toMatch(/Food Paradise/i);
    expect(res.chips.length).toBeGreaterThan(0);
  });

  test("starts preference quiz when user asks what should I eat", () => {
    let prefState = null;
    const setPreferenceState = (val) => {
      prefState = val;
    };
    const res = generateAmmuResponse("Help me choose what to eat", {
      setPreferenceState,
    });
    expect(res.text).toMatch(/3 quick questions/i);
    expect(res.preferenceStep).toBe("diet");
    expect(prefState).toEqual({ step: "diet", answers: {} });
  });

  test("processes preference steps and returns tailored recommendations", () => {
    let prefState = { step: "goal", answers: { diet: "veg", meal: "main" } };
    const setPreferenceState = (val) => {
      prefState = val;
    };
    const res = generateAmmuResponse("protein", {
      preferenceState: prefState,
      setPreferenceState,
      currentFoods: allFoods,
    });
    expect(res.text).toMatch(/handpicked/i);
    expect(res.foodCards.length).toBeGreaterThan(0);
  });

  test("tells the menu for normal mode and diet mode", () => {
    const normalRes = generateAmmuResponse("Show me the menu", { dietMode: false });
    expect(normalRes.text).toMatch(/Biryani/i);
    expect(normalRes.text).toMatch(/South Indian/i);

    const dietRes = generateAmmuResponse("Show me the menu", { dietMode: true });
    expect(dietRes.text).toMatch(/Diet Menu/i);
    expect(dietRes.text).toMatch(/Salads/i);
  });

  test("recommends high protein meals", () => {
    const res = generateAmmuResponse("Show high protein meals");
    expect(res.text).toMatch(/protein/i);
    expect(res.foodCards.length).toBeGreaterThan(0);
  });

  test("recommends low calorie meals under 150 kcal", () => {
    const res = generateAmmuResponse("Food under 150 calories");
    expect(res.text).toMatch(/150 kcal/i);
    expect(res.foodCards.length).toBeGreaterThan(0);
    res.foodCards.forEach((food) => {
      expect(food.calories).toBeLessThanOrEqual(150);
    });
  });

  test("recommends budget foods under 100", () => {
    const res = generateAmmuResponse("food under 100 rupees");
    expect(res.text).toMatch(/under ₹100/i);
    expect(res.foodCards.length).toBeGreaterThan(0);
    res.foodCards.forEach((food) => {
      expect(food.price).toBeLessThanOrEqual(100);
    });
  });

  test("retrieves ingredients for a specific dish", () => {
    const res = generateAmmuResponse("Ingredients of Masala Dosa");
    expect(res.text).toMatch(/Ingredients/i);
    expect(res.text).toMatch(/Masala Dosa/i);
    expect(res.foodCards[0].name).toBe("Masala Dosa");
  });

  test("summarizes cart items, GST taxes, and grand total", () => {
    const mockCart = [
      { id: 101, name: "Masala Dosa", price: 80, quantity: 2, calories: 350 },
      { id: 71, name: "Buttermilk", price: 30, quantity: 1, calories: 45 },
    ];
    const res = generateAmmuResponse("What is in my cart?", { cart: mockCart });
    expect(res.text).toMatch(/Masala Dosa/i);
    expect(res.text).toMatch(/Subtotal/i);
    expect(res.text).toMatch(/CGST/i);
    expect(res.text).toMatch(/SGST/i);
    expect(res.text).toMatch(/Grand Total/i);
  });

  test("handles mode switching commands", () => {
    let mode = false;
    const res = generateAmmuResponse("Switch to diet mode", {
      setDietMode: (val) => {
        mode = val;
      },
    });
    expect(res.text).toMatch(/switched your app to \*\*Diet Mode\*\*/i);
    expect(mode).toBe(true);
  });

  test("handles adding food to cart via text command", () => {
    let added = null;
    const res = generateAmmuResponse("add masala dosa to cart", {
      addToCart: (item) => {
        added = item;
      },
      currentFoods: allFoods,
    });
    expect(res.text).toMatch(/added \*\*Masala Dosa\*\*/i);
    expect(added.name).toBe("Masala Dosa");
  });
});
