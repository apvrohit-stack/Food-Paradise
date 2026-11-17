require("dotenv").config();

const fs = require("fs");
const mongoose = require("mongoose");
const Food = require("./Food");

async function migrateFoods() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected!");

        const foods = JSON.parse(
            fs.readFileSync("./foods.json", "utf8")
        );

        for (const food of foods) {
            await Food.updateOne(
                { legacyId: Number(food.id) },
                {
                    $setOnInsert: {
                        legacyId: Number(food.id),
                        name: food.name,
                        type: food.type,
                        price: Number(food.price),
                        calories: Number(food.calories),
                        serving: food.serving || "",
                        protein: food.protein || "",
                        ingredients: food.ingredients || ""
                    }
                },
                { upsert: true }
            );
        }

        const count = await Food.countDocuments();

        console.log("Migration completed!");
        console.log("Total food records in MongoDB:", count);

    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
}

migrateFoods();