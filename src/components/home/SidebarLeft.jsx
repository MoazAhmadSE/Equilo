import EquiloNoteLoader from "./EquiloNoteLoader";
import GroupList from "./GroupList";
import "../../css/pages/Home.css";

const SidebarLeft = ({ groups, handleCreateGroupModal }) => {
  return (
    <aside className="sidebar">
      <div className="left-bar">
        <div className="animation">
          <EquiloNoteLoader />
        </div>

        <nav>
          <a className="link" href="/equilo/home">
            Dashboard
          </a>
          <a className="link" href="/equilo/home">
            History
          </a>
        </nav>

        <GroupList
          groups={groups}
          handleCreateGroupModal={handleCreateGroupModal}
        />
      </div>
    </aside>
  );
};

export default SidebarLeft;
