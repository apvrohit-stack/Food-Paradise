import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5001/foods";

const EMPTY_FORM = {
  name: "",
  type: "Diet",
  price: "",
  calories: "",
  serving: "",
  protein: "",
  ingredients: "",
};

export default function FoodManagement() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load food records from Express.
  const loadFoods = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not load food records."
        );
      }

      setFoods(data);
    } catch (err) {
      setError(
        `${err.message} Make sure the Express API is running on port 5001.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  // Update form fields.
  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Reset the form.
  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  }

  // Add a new food or update an existing food.
  async function submitFood(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const payload = {
      name: form.name.trim(),
      type: form.type,
      price: Number(form.price),
      calories: Number(form.calories),
      serving: form.serving.trim(),
      protein: form.protein.trim(),
      ingredients: form.ingredients.trim(),
    };

    if (
      !payload.name ||
      form.price === "" ||
      form.calories === "" ||
      !payload.serving ||
      !payload.protein ||
      !payload.ingredients ||
      !Number.isFinite(payload.price) ||
      payload.price < 0 ||
      !Number.isFinite(payload.calories) ||
      payload.calories < 0
    ) {
      setError(
        "Please enter a food name, valid price and calories, serving size, protein, and ingredients."
      );
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const details = Array.isArray(data.errors)
          ? ` ${data.errors.join(" ")}`
          : "";

        throw new Error(
          (data.message || "Could not save the food item.") +
            details
        );
      }

      setMessage(
        editingId
          ? "Food item updated successfully."
          : "Food item added successfully."
      );

      resetForm();

      await loadFoods();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Load existing food details into the form.
  function startEdit(food) {
    setEditingId(food.id);

    setForm({
      name: food.name || "",
      type: food.type || "Diet",
      price: String(food.price ?? ""),
      calories: String(food.calories ?? ""),
      serving: food.serving || "",
      protein: food.protein || "",
      ingredients: food.ingredients || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Delete a food record.
  async function deleteFood(food) {
    if (!window.confirm(`Delete ${food.name}?`)) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${food.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not delete the food item."
        );
      }

      setMessage(`${food.name} deleted successfully.`);

      if (editingId === food.id) {
        resetForm();
      }

      await loadFoods();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="food-admin-page">
      <div className="food-admin-heading">
        <p className="food-admin-eyebrow">
          FOOD PARADISE · REST API
        </p>

        <h2>Food Management</h2>

        <p>
          Add, view, update, and delete menu records using
          the Express REST API.
        </p>
      </div>

      {/* Add and edit food form */}
      <section className="food-admin-panel">
        <h3>
          {editingId
            ? `Edit Food #${editingId}`
            : "Add a Food Item"}
        </h3>

        <form
          className="food-admin-form"
          onSubmit={submitFood}
        >
          <label>
            Food name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="e.g. Vegetable Upma"
              required
              maxLength="100"
            />
          </label>

          <label>
            Category
            <select
              name="type"
              value={form.type}
              onChange={updateField}
            >
              <option value="Diet">Diet</option>
              <option value="Normal">Normal</option>
            </select>
          </label>

          <label>
            Price (₹)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={updateField}
              placeholder="60"
              required
            />
          </label>

          <label>
            Calories (kcal)
            <input
              name="calories"
              type="number"
              min="0"
              step="1"
              value={form.calories}
              onChange={updateField}
              placeholder="180"
              required
            />
          </label>

          <label>
            Serving Size
            <input
              name="serving"
              value={form.serving}
              onChange={updateField}
              placeholder="e.g. 1 bowl"
              required
            />
          </label>

          <label>
            Protein
            <input
              name="protein"
              value={form.protein}
              onChange={updateField}
              placeholder="e.g. 8 g"
              required
            />
          </label>

          <label>
            Ingredients
            <textarea
              name="ingredients"
              value={form.ingredients}
              onChange={updateField}
              placeholder="e.g. Rice, vegetables, spices"
              required
              rows="3"
            />
          </label>

          <div className="food-admin-form-actions">
            <button
              className="food-admin-primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Food"}
            </button>

            {editingId && (
              <button
                className="food-admin-secondary"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="food-admin-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="food-admin-error" role="alert">
            {error}
          </p>
        )}
      </section>

      {/* Existing food records */}
      <section className="food-admin-panel">
        <div className="food-admin-table-heading">
          <div>
            <h3>Menu Records</h3>
            <p>
              Loaded from <code>GET /foods</code>
            </p>
          </div>

          <button
            className="food-admin-secondary"
            type="button"
            onClick={loadFoods}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading food records…</p>
        ) : foods.length === 0 ? (
          <p>
            No food records yet. Add your first food item above.
          </p>
        ) : (
          <div className="food-admin-table-wrap">
            <table className="food-admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Food name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Calories</th>
                  <th>Serving</th>
                  <th>Protein</th>
                  <th>Ingredients</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {foods.map((food) => (
                  <tr key={food.id}>
                    <td>{food.id}</td>

                    <td>{food.name}</td>

                    <td>
                      <span
                        className={`food-admin-tag ${
                          food.type === "Diet"
                            ? "diet"
                            : "normal"
                        }`}
                      >
                        {food.type}
                      </span>
                    </td>

                    <td>
                      ₹
                      {Number(food.price).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>{food.calories} kcal</td>

                    <td>{food.serving || "—"}</td>

                    <td>{food.protein || "—"}</td>

                    <td>{food.ingredients || "—"}</td>

                    <td className="food-admin-actions">
                      <button
                        type="button"
                        className="food-admin-edit"
                        onClick={() => startEdit(food)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="food-admin-delete"
                        onClick={() => deleteFood(food)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="food-admin-api-note">
        REST endpoints: <code>GET /foods</code> ·{" "}
        <code>GET /foods/:id</code> ·{" "}
        <code>POST /foods</code> ·{" "}
        <code>PUT /foods/:id</code> ·{" "}
        <code>DELETE /foods/:id</code>
      </p>
    </main>
  );
}