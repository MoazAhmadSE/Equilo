import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <div>
        <Outlet/>
      </div>
    </div>
  );
};

export default Home;
