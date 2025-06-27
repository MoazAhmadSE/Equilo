const GroupHeader = ({ groupData, creatorName }) => (
  <div className="group-header">
    <h2 className="group-title">{groupData.groupName}</h2>
    <p className="group-desc">{groupData.description || "No description."}</p>
    <p className="group-subtext">
      Created by: <strong>{creatorName}</strong>
    </p>
    <p className="group-subtext">
      Created at:{" "}
      {groupData.createdAt?.toDate().toLocaleString("en-GB", {
        dateStyle: "long",
        timeStyle: "short",
      })}
    </p>
  </div>
);
export default GroupHeader;
