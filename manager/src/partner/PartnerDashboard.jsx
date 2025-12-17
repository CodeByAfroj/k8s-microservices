import PartnerHeader from "./component/PartnerHeader";
import MapView from "./component/MapView";
import DeliveryCard from "./component/DeliveryCard";

const PartnerDashboard = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <PartnerHeader />
      <MapView />
      <DeliveryCard />
    </div>
  );
};

export default PartnerDashboard;
