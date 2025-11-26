import { useEffect, useState } from "react";
import { getEquipment } from "./api/equipmentApi";

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getEquipment().then(res => setItems(res.data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Equipment List</h1>

      <ul className="mt-4">
        {items.map(e => (
          <li key={e._id} className="border p-2 my-2 rounded">
            {e.name} ({e.code})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
