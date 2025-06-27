const GroupMembersList = ({ members }) => (
  <div className="group-members">
    <h3 className="group-members-heading">Members</h3>
    <ul className="member-list">
      {members.map((m) => (
        <li key={m.id} className={`member-item ${!m.isJoined ? "blurred" : ""}`}>
          <span className="member-name">{m.name}</span>
          <span className="member-email">({m.email})</span>
          {m.isAdmin && <span className="admin-badge">Admin</span>}
        </li>
      ))}
    </ul>
  </div>
);
export default GroupMembersList;
