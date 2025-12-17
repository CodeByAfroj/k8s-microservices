const Sidebar = () => {
  return (
    <div className="w-64 bg-black text-white p-4">
      <h2 className="text-xl font-bold mb-6">🍽️ Zomato Partner</h2>

      <ul className="space-y-4">
        <li className="cursor-pointer">📦 Orders</li>
        <li className="cursor-pointer">🍔 Menu</li>
        <li className="cursor-pointer">💰 Earnings</li>
        <li className="cursor-pointer">⚙️ Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;
