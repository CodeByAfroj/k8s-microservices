const OrderCard = ({ orderId, customer, amount, items }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-bold">{orderId}</h3>
      <p className="text-sm text-gray-600">{customer}</p>
      <p className="mt-2">{items}</p>
      <p className="font-semibold mt-2">{amount}</p>

      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-green-500 text-white py-2 rounded">
          Accept
        </button>
        <button className="flex-1 bg-red-500 text-white py-2 rounded">
          Reject
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
