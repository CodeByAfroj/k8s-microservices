import OrderCard from "./OrderCard";

const LiveOrders = () => {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">

      <OrderCard
        orderId="#2451"
        customer="Rahul"
        amount="₹420"
        items="Paneer Burger x1, Fries x1"
      />

      <OrderCard
        orderId="#2452"
        customer="Anjali"
        amount="₹310"
        items="Veg Pizza x1"
      />

    </div>
  );
};

export default LiveOrders;
