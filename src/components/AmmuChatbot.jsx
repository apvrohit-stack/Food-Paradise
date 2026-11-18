import React, { useState, useEffect, useRef } from "react";
import "./AmmuChatbot.css";
import {
  generateAmmuResponse,
  DEFAULT_QUICK_ACTIONS,
  getRandomEmoji,
} from "./ammuBrain";
import { allFoods, getFoodPrice } from "../data/foodData";
import {
  selectGirlVoice,
  cleanTextForSpeech,
  isMaleVoice,
  getGuaranteedFemaleVoice,
  getAvailableFemaleVoices,
  getLiveFemaleVoice,
} from "./voiceHelper";

export default function AmmuChatbot({
  dietMode,
  setDietMode,
  cart = [],
  addToCart,
  orders = [],
  categories = [],
  selectedCategory,
  setSelectedCategory,
  maxCalories,
  setMaxCalories,
  searchTerm,
  setSearchTerm,
  setShowCart,
  setShowOrders,
  setShowFoodManagement,
  loggedIn = false,
  username = "",
  currentFoods = allFoods,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [preferredVoiceName, setPreferredVoiceName] = useState("Samantha");
  const [availableFemaleVoices, setAvailableFemaleVoices] = useState([]);
  const [preferenceState, setPreferenceState] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [unreadCount, setUnreadCount] = useState(1);
  const [cartAlert, setCartAlert] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const selectedVoiceRef = useRef(null);

  // Initialize and guarantee English girl voices from browser
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const syncVoices = () => {
      const all = window.speechSynthesis.getVoices() || [];
      const females = getAvailableFemaleVoices(all);
      setAvailableFemaleVoices(females);

      const girlVoice = selectGirlVoice(all, preferredVoiceName);
      if (girlVoice && !isMaleVoice(girlVoice)) {
        selectedVoiceRef.current = girlVoice;
        setSelectedVoice(girlVoice);
        setPreferredVoiceName(girlVoice.name);
      }
    };

    syncVoices();
    getGuaranteedFemaleVoice(preferredVoiceName).then((v) => {
      if (v && !isMaleVoice(v)) {
        selectedVoiceRef.current = v;
        setSelectedVoice(v);
        setPreferredVoiceName(v.name);
      }
    });

    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener("voiceschanged", syncVoices);
    }
    window.speechSynthesis.onvoiceschanged = syncVoices;

    return () => {
      if ("speechSynthesis" in window) {
        if (window.speechSynthesis.removeEventListener) {
          window.speechSynthesis.removeEventListener("voiceschanged", syncVoices);
        }
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [preferredVoiceName]);

  // Initial welcome message from Ammu
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ammu",
      text: `Hello there${
        username ? " " + username : ""
      }! I'm **Ammu**, your friendly foodie companion at Food Paradise! 👩‍🍳✨\n\nI can tell you all about our menu, ask your taste & health preferences, recommend delicious meals, and add them straight to your cart. How can I delight your tastebuds today?`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      chips: DEFAULT_QUICK_ACTIONS,
    },
  ]);

  // Auto-hide floating tooltip after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Test female voice immediately
  const handleTestVoice = (voiceName) => {
    const targetName = voiceName || preferredVoiceName || "Samantha";
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    setTimeout(() => {
      const freshVoices = window.speechSynthesis.getVoices() || [];
      const testVoice = getLiveFemaleVoice(targetName, freshVoices);
      if (!testVoice || isMaleVoice(testVoice)) return;

      const utterance = new SpeechSynthesisUtterance(
        `Hello! I'm Ammu, speaking with ${testVoice.name}'s female voice!`
      );
      utterance.voice = testVoice;
      utterance.lang = testVoice.lang || "en-US";
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }, 30);
  };

  // Voice synthesis helper strictly configured for Samantha / English female voice
  const speakText = (text, forceSpeak = false) => {
    if ((!voiceEnabled && !forceSpeak) || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();

      // Brief pause to allow cancellation to flush in Chrome
      setTimeout(() => {
        const freshVoices = window.speechSynthesis.getVoices() || [];
        const liveGirlVoice = getLiveFemaleVoice(preferredVoiceName, freshVoices);

        // ABSOLUTE PROTECTION: Never speak without a confirmed female voice object!
        if (!liveGirlVoice || isMaleVoice(liveGirlVoice)) {
          console.warn("Ammu: Speech cancelled because no verified female voice is available. Preventing male fallback.");
          return;
        }

        const clean = cleanTextForSpeech(text);
        if (!clean) return;

        const utterance = new SpeechSynthesisUtterance(clean);
        // Bind the LIVE SpeechSynthesisVoice object from the current voices array
        utterance.voice = liveGirlVoice;
        utterance.lang = liveGirlVoice.lang || "en-US";

        // Natural Samantha female pitch: 1.0 (avoids macOS pitch-unit fallback to Alex)
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
      }, 30);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Deliver Ammu's response with a natural typing delay
  const deliverAmmuReply = (rawResponse) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const newMsg = {
        id: "ammu_" + Date.now(),
        sender: "ammu",
        text: rawResponse.text,
        foodCards: rawResponse.foodCards,
        chips: rawResponse.chips,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, newMsg]);
      speakText(rawResponse.text);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    }, 450);
  };

  // Handle user sending a message
  const handleSendMessage = (messageText) => {
    const textToSend = (messageText || inputValue).trim();
    if (!textToSend) return;

    const userMsg = {
      id: "user_" + Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Context passed to brain
    const context = {
      dietMode,
      setDietMode,
      cart,
      addToCart,
      orders,
      categories,
      selectedCategory,
      setSelectedCategory,
      maxCalories,
      setMaxCalories,
      searchTerm,
      setSearchTerm,
      setShowCart,
      setShowOrders,
      setShowFoodManagement,
      preferenceState,
      setPreferenceState,
      currentFoods,
    };

    const reply = generateAmmuResponse(textToSend, context);
    deliverAmmuReply(reply);
  };

  // Handle clicking an interactive chip or button
  const handleChipClick = (chip) => {
    if (chip.action) {
      if (chip.action.startsWith("pref_")) {
        // e.g. pref_diet_veg, pref_meal_breakfast, pref_goal_protein
        handleSendMessage(chip.label);
      } else if (chip.action.startsWith("add_food_")) {
        const foodId = Number(chip.action.replace("add_food_", ""));
        const targetFood = allFoods.find((f) => f.id === foodId);
        if (targetFood) {
          handleAddFoodToCart(targetFood);
        }
      } else if (chip.action === "open_cart") {
        if (setShowCart) setShowCart(true);
        if (setShowOrders) setShowOrders(false);
        if (setShowFoodManagement) setShowFoodManagement(false);
        deliverAmmuReply({
          text: "I've opened your cart for you! 🛒 Let me know if you want to add anything else delicious!",
        });
      }
    } else if (chip.query) {
      handleSendMessage(chip.query);
    }
  };

  // Handle adding a food card to the cart
  const handleAddFoodToCart = (food) => {
    if (!food) return;

    if (!loggedIn) {
      deliverAmmuReply({
        text: `Oh, ${food.name} is a fantastic choice! 😋 Please log in or create an account first so I can add it to your order!`,
      });
      return;
    }

    if (addToCart) {
      const fullFoodItem = {
        ...food,
        price: getFoodPrice(food),
      };
      addToCart(fullFoodItem);

      const emoji = getRandomEmoji();
      setCartAlert(`Added ${food.name} to cart!`);
      setTimeout(() => setCartAlert(""), 3000);

      const thankNotes = [
        `Yum! Added **${food.name}** (₹${fullFoodItem.price}) to your cart! 🛒 ${emoji}`,
        `Awesome pick! **${food.name}** has been added to your cart! 😋 Ready for more, or shall we checkout?`,
        `Done and done! **${food.name}** is safely in your cart! 🍲 Anything refreshing to drink with that?`,
      ];
      const note = thankNotes[Math.floor(Math.random() * thankNotes.length)];

      deliverAmmuReply({
        text: note,
        chips: [
          { label: "🛒 View Cart", query: "What is in my cart?" },
          { label: "🥤 Drinks & Juices", query: "Show drinks" },
          { label: "📋 More Food", query: "Show me the menu" },
        ],
      });
    }
  };

  // Handle viewing food in main page menu
  const handleViewInMenu = (food) => {
    if (setSearchTerm) setSearchTerm(food.name);
    if (setShowCart) setShowCart(false);
    if (setShowOrders) setShowOrders(false);
    if (setShowFoodManagement) setShowFoodManagement(false);

    setTimeout(() => {
      document.getElementById("food-menu")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);

    deliverAmmuReply({
      text: `Filtered the menu to **${food.name}**! 🔍 Scroll up to see it with all the details on the page!`,
    });
  };

  // Reset chat history
  const handleResetChat = () => {
    setPreferenceState(null);
    setMessages([
      {
        id: "fresh_start_" + Date.now(),
        sender: "ammu",
        text: "Fresh start! 🌿 Ammu is ready to help again. What kind of food are you looking for?",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        chips: DEFAULT_QUICK_ACTIONS,
      },
    ]);
  };

  return (
    <div className={`ammu-chatbot-container ${dietMode ? "diet-mode-theme" : ""}`}>
      {/* Toast alert when item is added */}
      {cartAlert && (
        <div className="ammu-cart-toast">
          <span>✅</span> {cartAlert}
        </div>
      )}

      {/* Floating launcher tooltip */}
      {!isOpen && showTooltip && (
        <div
          className="ammu-floating-tooltip"
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
        >
          <span className="tooltip-avatar">👩‍🍳</span>
          <div className="tooltip-text">
            <strong>Hi, I'm Ammu!</strong>
            <span>Need help choosing your meal?</span>
          </div>
          <button
            type="button"
            className="tooltip-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          className="ammu-launcher-button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
            setShowTooltip(false);
          }}
          aria-label="Open Ammu Foodie Chatbot"
        >
          <span className="launcher-avatar">👩‍🍳</span>
          <span className="launcher-pulse"></span>
          {unreadCount > 0 && (
            <span className="ammu-unread-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`ammu-chat-window ${isMinimized ? "is-minimized" : ""}`}
        >
          {/* Header */}
          <div
            className="ammu-header"
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="ammu-header-left">
              <div className="ammu-avatar-wrapper">
                <span className="ammu-avatar">👩‍🍳</span>
                <span className="ammu-online-dot" title="Ammu is online"></span>
              </div>
              <div className="ammu-title-info">
                <h3>Ammu</h3>
                <span className="ammu-status">
                  Foodie Guide • {selectedVoice ? `👧 ${selectedVoice.name} (Girl Voice)` : (dietMode ? "🥗 Diet Mode" : "🍽️ Normal Mode")}
                </span>
              </div>
            </div>

            <div className="ammu-header-actions">
              {/* Voice toggle button */}
              <button
                type="button"
                className={`ammu-action-btn ${voiceEnabled ? "active" : ""}`}
                title={
                  voiceEnabled
                    ? "Mute Ammu's voice"
                    : "Enable Ammu's voice (Friendly Girl Voice)"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  const nextState = !voiceEnabled;
                  setVoiceEnabled(nextState);
                  if (nextState) {
                    speakText("Hello! I'm Ammu! How can I help you today?", true);
                  } else if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </button>

              {/* Reset chat button */}
              <button
                type="button"
                className="ammu-action-btn"
                title="Restart Conversation"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetChat();
                }}
              >
                🔄
              </button>

              {/* Minimize button */}
              <button
                type="button"
                className="ammu-action-btn"
                title={isMinimized ? "Maximize" : "Minimize"}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
              >
                {isMinimized ? "▢" : "—"}
              </button>

              {/* Close button */}
              <button
                type="button"
                className="ammu-action-btn close-btn"
                title="Close Ammu"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body (only when not minimized) */}
          {!isMinimized && (
            <>
              {/* Active Girl Voice Indicator / Selector */}
              {voiceEnabled && (
                <div className="ammu-voice-banner">
                  <span className="voice-banner-label">👧 Girl Voice:</span>
                  <select
                    value={preferredVoiceName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setPreferredVoiceName(newName);
                      handleTestVoice(newName);
                    }}
                    className="ammu-voice-select"
                  >
                    {availableFemaleVoices.length > 0 ? (
                      availableFemaleVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          👩‍🍳 {v.name} ({v.lang})
                        </option>
                      ))
                    ) : (
                      <option value="Samantha">👩‍🍳 Samantha (en_US)</option>
                    )}
                  </select>
                  <button
                    type="button"
                    className="ammu-test-voice-btn"
                    title="Click to hear Ammu speaking in this female voice"
                    onClick={() => handleTestVoice(preferredVoiceName)}
                  >
                    ▶ Test Voice
                  </button>
                </div>
              )}

              <div className="ammu-messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ammu-message-row ${
                      msg.sender === "user" ? "user-row" : "ammu-row"
                    }`}
                  >
                    {msg.sender === "ammu" && (
                      <div className="ammu-msg-avatar">👩‍🍳</div>
                    )}

                    <div className="ammu-msg-content-wrapper">
                      <div
                        className={`ammu-message-bubble ${
                          msg.sender === "user" ? "user-bubble" : "ammu-bubble"
                        }`}
                      >
                        <div className="bubble-text">
                          {msg.text.split("\n").map((line, i) => {
                            if (!line) return <br key={i} />;
                            // Simple parser for bold **text**
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <p key={i}>
                                {parts.map((p, j) => {
                                  if (p.startsWith("**") && p.endsWith("**")) {
                                    return (
                                      <strong key={j}>{p.slice(2, -2)}</strong>
                                    );
                                  }
                                  return p;
                                })}
                              </p>
                            );
                          })}
                        </div>
                        <span className="bubble-time">{msg.time}</span>
                      </div>

                      {/* Food Cards attached to message */}
                      {msg.foodCards && msg.foodCards.length > 0 && (
                        <div className="ammu-food-cards-grid">
                          {msg.foodCards.map((food) => {
                            const price = getFoodPrice(food);
                            return (
                              <div className="ammu-food-card" key={food.id}>
                                <div className="card-top">
                                  <h4 className="food-name">{food.name}</h4>
                                  <span className="food-category-pill">
                                    {food.category}
                                  </span>
                                </div>

                                <div className="card-meta">
                                  <span className="price-tag">₹{price}</span>
                                  <span className="cal-tag">
                                    🔥 {food.calories} kcal
                                  </span>
                                  {food.protein && (
                                    <span className="protein-tag">
                                      💪 {food.protein}
                                    </span>
                                  )}
                                </div>

                                {food.serving && (
                                  <p className="card-serving">
                                    Serving: {food.serving}
                                  </p>
                                )}

                                <div className="card-buttons">
                                  <button
                                    type="button"
                                    className="add-btn"
                                    onClick={() => handleAddFoodToCart(food)}
                                  >
                                    + Add to Cart
                                  </button>
                                  <button
                                    type="button"
                                    className="view-btn"
                                    title="Filter & view on menu"
                                    onClick={() => handleViewInMenu(food)}
                                  >
                                    🔍
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Suggestion Chips */}
                      {msg.chips && msg.chips.length > 0 && (
                        <div className="ammu-inline-chips">
                          {msg.chips.map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="ammu-chip-btn"
                              onClick={() => handleChipClick(chip)}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="ammu-message-row ammu-row">
                    <div className="ammu-msg-avatar">👩‍🍳</div>
                    <div className="ammu-typing-bubble">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions Scroll Bar */}
              <div className="ammu-quick-bar">
                {DEFAULT_QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="ammu-quick-btn"
                    onClick={() => handleSendMessage(action.query)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input Field */}
              <form
                className="ammu-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask Ammu (e.g. 'High protein breakfast')..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="ammu-send-btn"
                  title="Send message"
                >
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
