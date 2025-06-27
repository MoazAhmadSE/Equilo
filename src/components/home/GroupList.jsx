import { useNavigate } from "react-router-dom";
import "../../css/pages/Home.css";
import SVGIcons from "../../assets/icons/SVGIcons";

const GroupList = ({ groups, handleCreateGroupModal }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="group-container">
        <div>Groups</div>
        <div className="plus-icon-wrapper" onClick={handleCreateGroupModal}>
          <SVGIcons.plus width="30" height="30" fill="var(--primary)" />
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
