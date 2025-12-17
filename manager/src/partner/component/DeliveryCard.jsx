const DeliveryCard = () => {
  return (
    <div className="bg-white shadow-lg p-4">
      <h3 className="font-bold">New Delivery Request</h3>

      <p className="text-sm mt-2">
        📍 Pickup: Domino's Pizza, MG Road
      </p>

      <p className="text-sm">
        🏠 Drop: Anna Nagar, Chennai
      </p>

      <p className="font-semibold mt-2">Earnings: ₹60</p>

      <div className="flex gap-3 mt-4">
        <button className="flex-1 bg-green-600 text-white py-2 rounded">
          Accept
        </button>
        <button className="flex-1 bg-red-500 text-white py-2 rounded">
          Reject
        </button>
      </div>
    </div>
  );
};

export default DeliveryCard;
