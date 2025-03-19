import { useState } from "react";

const users = [
  { id: 1, name: "Lê Thị Quỳnh Như", avatar: "https://via.placeholder.com/40" },
  { id: 2, name: "Cloud của tôi", avatar: "https://via.placeholder.com/40" },
  { id: 3, name: "Trần Văn B", avatar: "https://via.placeholder.com/40" },
  { id: 4, name: "Nguyễn Thị A", avatar: "https://via.placeholder.com/40" },
];

export default function UserFilter() {
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredUsers(
      users.filter((user) => user.name.toLowerCase().includes(value))
    );
  };

  return (
    <div className="relative w-72">
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Ẩn dropdown sau khi mất focus
        className="w-full p-2 border rounded-md"
        placeholder="Tìm người gửi..."
      />

      {showDropdown && filteredUsers.length > 0 && (
        <div className="absolute w-full bg-white border rounded-md shadow-md mt-1 z-10">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
