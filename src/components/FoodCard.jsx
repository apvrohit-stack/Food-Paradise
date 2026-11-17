function FoodCard(props) {
  return (
    <div className="food-card">

      <img
        src={props.image}
        alt={props.name}
      />

      <div className="food-info">

        <h3>{props.name}</h3>

        <p>{props.description}</p>

        <p>₹{props.price}</p>

        <p>🔥 {props.calories} kcal</p>

        <button>View Details</button>

      </div>

    </div>
  );
}

export default FoodCard;