import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";
import {
  SocketContextProps,
  SocketProviderProps,
} from "../interfaces/interface";

const SocketContext = createContext<SocketContextProps | null>(null);

export const useSocket = () => {
  const socketContextValue = useContext(SocketContext);

  return socketContextValue;
};

export const SocketProvider: React.FC<SocketProviderProps> = (props) => {
  const socket = useMemo(() => io("http://localhost:3000"), []);

  const socketContextValue: SocketContextProps = {
    socket,
    emit: (event, data) => socket.emit(event, data),
    on: (event, callback) => socket.on(event, callback),
    off: (event, callback) => socket.off(event, callback),
  };

  return (
    <SocketContext.Provider value={socketContextValue}>
      {props.children}
    </SocketContext.Provider>
  );
};
