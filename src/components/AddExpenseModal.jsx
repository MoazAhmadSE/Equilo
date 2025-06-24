// src/components/AddExpenseModal.jsx
import React, { useState } from "react";
import "../css/components/AddExpenseModal.css";

const AddExpenseModal = ({ isOpen, onClose, groupId, onAdd }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    onAdd({ amount: parseFloat(amount), description });
    setAmount("");
    setDescription("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Add New Expense</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button type="submit" className="btn-add">
              Add
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
