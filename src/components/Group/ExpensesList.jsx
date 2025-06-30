import SVGIcons from "../../assets/icons/SVGIcons";

const ExpensesList = ({ expenses, onSelect }) => {
  return (
    <div className="group-expenses">
      <h3 className="group-expenses-heading">Expenses</h3>
      {expenses.length === 0 ? (
        <p>No expenses added yet.</p>
      ) : (
        <ul className="expense-list">
          <div className="expense-button-container">
            {expenses.map((exp) => {
              const icon =
                exp.direction === "up" ? (
                  <SVGIcons.redArrowUp />
                ) : exp.direction === "down" ? (
                  <SVGIcons.greenArrowDown />
                ) : (
                  "✅"
                );

              return (
                <button
                  key={exp.expenseId || exp.id}
                  className="expense-button"
                  onClick={() => onSelect(exp)}
                >
                  {icon} {exp.title} – RS. {exp.totalAmount?.toFixed(2)}
                </button>
              );
            })}
          </div>
        </ul>
      )}
    </div>
  );
};

export default ExpensesList;
