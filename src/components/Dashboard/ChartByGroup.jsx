import UserGroupExpenseCharts from "./GroupUserExpenseCharts";
import "../../css/pages/Dashboard.css";

const ChartByGroup = ({ groupIds }) => {
  return (
    <div className="charts-section">
      <h2 className="charts-heading">Your Group Activity</h2>
      {groupIds.length === 0 ? (
        <p className="no-groups-text">You're not part of any groups yet.</p>
      ) : (
        <UserGroupExpenseCharts />
      )}
    </div>
  );
};

export default ChartByGroup;
