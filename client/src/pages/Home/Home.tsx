import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";

const Home = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const socketContextValue = useSocket();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name || !room) {
      setError("All fields are mandatory !!");
      return;
    }

    socketContextValue?.emit("room:join", { name, room });
    setName("");
    setRoom("");
    setError(""); 
  };

  const handleRoomJoin = (room: String) => {
    navigate(`/room/${room}`);
  };

  useEffect(() => {
    socketContextValue?.on("room:join", handleRoomJoin);

    return () => {
      socketContextValue?.off("room:join", handleRoomJoin);
    };
  }, [socketContextValue]);

  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Join a Room and Share Files
        </h1>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 p-2 border rounded-md w-full outline-none"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <label
            htmlFor="room"
            className="block mt-4 text-sm font-medium text-gray-700"
          >
            Room Number:
          </label>
          <input
            type="text"
            id="room"
            className="mt-1 p-2 border rounded-md w-full outline-none"
            placeholder="Enter your room number"
            value={room}
            onChange={(event) => setRoom(event.target.value)}
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-4 py-2 px-8 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Home;
