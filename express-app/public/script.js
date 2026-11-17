const API_URL = "/foods";

const form = document.getElementById("foodForm");
const table = document.getElementById("foodTable");
const message = document.getElementById("message");
const cancelEdit = document.getElementById("cancelEdit");

let editingId = null;
let foods = [];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#c62828" : "#147d55";
}

function resetForm() {
  form.reset();
  editingId = null;
  document.getElementById("formTitle").textContent = "Add Food Item";
  form.querySelector('button[type="submit"]').textContent = "Save Food";
  cancelEdit.hidden = true;
}

async function loadFoods() {
  try {
    foods = await apiRequest(API_URL);
    table.replaceChildren();

    foods.forEach(food => {
      const row = document.createElement("tr");

      [
        food.id,
        food.name,
        food.type,
        `₹${food.price}`,
        `${food.calories} kcal`
      ].forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      const actions = document.createElement("td");

      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.className = "edit";
      edit.addEventListener("click", () => startEdit(food.id));

      const remove = document.createElement("button");
      remove.textContent = "Delete";
      remove.className = "delete";
      remove.addEventListener("click", () => deleteFood(food.id));

      actions.append(edit, remove);
      row.appendChild(actions);
      table.appendChild(row);
    });

    if (!foods.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.textContent = "No food records found.";
      row.appendChild(cell);
      table.appendChild(row);
    }
  } catch (error) {
    showMessage(error.message, true);
  }
}

function startEdit(id) {
  const food = foods.find(item => Number(item.id) === Number(id));
  if (!food) return;

  editingId = food.id;
  document.getElementById("name").value = food.name;
  document.getElementById("type").value = food.type;
  document.getElementById("price").value = food.price;
  document.getElementById("calories").value = food.calories;

  document.getElementById("formTitle").textContent = "Edit Food Item";
  form.querySelector('button[type="submit"]').textContent = "Update Food";
  cancelEdit.hidden = false;
  showMessage(`Editing ${food.name}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const food = {
    name: document.getElementById("name").value.trim(),
    type: document.getElementById("type").value,
    price: Number(document.getElementById("price").value),
    calories: Number(document.getElementById("calories").value)
  };

  if (
    !food.name ||
    !Number.isFinite(food.price) ||
    !Number.isFinite(food.calories) ||
    food.price < 0 ||
    food.calories < 0
  ) {
    showMessage("Enter valid food details.", true);
    return;
  }

  try {
    const isEditing = editingId !== null;
    const url = isEditing ? `${API_URL}/${editingId}` : API_URL;

    await apiRequest(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(food)
    });

    resetForm();
    showMessage(isEditing ? "Food updated successfully." : "Food added successfully.");
    await loadFoods();
  } catch (error) {
    showMessage(error.message, true);
  }
});

async function deleteFood(id) {
  const food = foods.find(item => Number(item.id) === Number(id));

  if (!food || !confirm(`Delete ${food.name}?`)) return;

  try {
    await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
    showMessage("Food deleted successfully.");
    await loadFoods();
  } catch (error) {
    showMessage(error.message, true);
  }
}

cancelEdit.addEventListener("click", resetForm);
document.getElementById("refresh").addEventListener("click", loadFoods);

loadFoods();
