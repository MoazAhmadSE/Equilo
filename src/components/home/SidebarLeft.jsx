import EquiloNoteLoader from "./EquiloNoteLoader";
import GroupList from "./GroupList";
import "../../css/pages/Home.css";
import { Link } from "react-router-dom";

const SidebarLeft = ({ groups, handleCreateGroupModal }) => {
  return (
    <aside className="sidebar left-bar">
      <div className="animation">
        <EquiloNoteLoader />
      </div>

      <Link className="link" to={"/equilo/home"}>
        Dashboard
      </Link>
      {/* <Link className="link" to={"/equilo/home"}>
        History
      </Link> */}

      <GroupList
        groups={groups}
        handleCreateGroupModal={handleCreateGroupModal}
      />
    </aside>
  );
};

export default SidebarLeft;
