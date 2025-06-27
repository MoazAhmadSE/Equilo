const GroupActions = ({ isAdmin, onDelete, onEdit }) => {
  if (!isAdmin) return null;

  return (
    <div className="group-actions mt-4">
      <button className="btn-delete" onClick={onDelete}>
        🗑️ Delete Group
      </button>
      <button className="btn-add" onClick={onEdit}>
        ✏️ Edit Group
      </button>
    </div>
  );
};
export default GroupActions;
