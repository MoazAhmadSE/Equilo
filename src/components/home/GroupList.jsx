import { useNavigate } from "react-router-dom";
import "../../css/pages/Home.css";

const GroupList = ({ groups, handleCreateGroupModal }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="group-container">
        <div>Groups</div>
        <div className="plus-icon-wrapper" onClick={handleCreateGroupModal}>
          <svg className="plus-icon" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <hr className="group-devider" />
      <div className="group-list">
        {groups.map((group) => (
          <div
            key={group.groupId}
            className="group-item"
            onClick={() => navigate(`/equilo/home/group/${group.groupId}`)}
          >
            {group.groupName}
          </div>
        ))}
      </div>
    </>
  );
};

export default GroupList;
