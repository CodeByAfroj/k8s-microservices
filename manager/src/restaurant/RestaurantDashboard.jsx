import Sidebar from "./component/Sidebar";
import HeaderBar from "./component/HeaderBar";
import LiveOrders from "./component/LiveOrders";

const RestaurantDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <HeaderBar />
        <LiveOrders />
      </div>
    </div>
  );
};

export default RestaurantDashboard;
