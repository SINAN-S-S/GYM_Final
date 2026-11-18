export default function MealCard({ meal }) {
  return (
    <div className="meal-card">
      <h4>{meal?.name || "Meal"}</h4>
      <p>{meal?.calories || 0} kcal</p>
    </div>
  );
}

