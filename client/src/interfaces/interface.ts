import { Socket } from "socket.io-client";
import { ReactNode } from "react";

export interface SocketEvent {
  name: string;
  id: string;
}

export interface IncomingRequest {
  from: string;
  offer: RTCSessionDescriptionInit;
}
export interface RequestAccepted {
  from: string;
  answer: RTCSessionDescriptionInit;
}

export interface SocketProviderProps {
  children: ReactNode;
}

export interface SocketContextProps {
  socket: Socket | null;
  emit: (event: string, data?: any) => void;
  on: <T = any>(event: string, callback: (data: T) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}
