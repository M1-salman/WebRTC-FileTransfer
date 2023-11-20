import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketProvider";
import {
  addAnswer,
  dataChannel,
  getAnswer,
  getOffer,
  peerConnection,
} from "../../service/peer";
import {
  SocketEvent,
  IncomingRequest,
  RequestAccepted,
} from "../../interfaces/interface";
import { CheckCheck } from "lucide-react";

const Room = () => {
  const socketContextValue = useSocket();
  const [remoteSocketName, setRemoteSocketName] = useState("");
  const [remoteSocketId, setRemoteSocketId] = useState("");
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [downloadLinkName, setDownloadLinkName] = useState<string | null>(null);

  const handleUserJoined = (data: SocketEvent) => {
    const { name, id } = data;
    setRemoteSocketName(name);
    setRemoteSocketId(id);
  };

  const handleUserConnection = async () => {
    const offer = await getOffer();
    socketContextValue?.emit("user:request", { to: remoteSocketId, offer });
  };

  const handleIncomingRequest = async ({ from, offer }: IncomingRequest) => {
    setRemoteSocketId(from);
    const answer = await getAnswer(offer);
    socketContextValue?.emit("request:accepted", { to: from, answer });
  };

  const handleRequestAccepted = ({ answer }: RequestAccepted) => {
    addAnswer(answer);
    setIsRequestPending(true);
  };

  const handleSelectedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
    } else {
      setSelectedFile(null);
      setSelectedFileName(null);
    }
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile || !selectedFileName) {
      setError("Upload a File !");
      return;
    }

    if (selectedFile) {
      const fileBuffer = await selectedFile.arrayBuffer();
      dataChannel?.send(fileBuffer);
    }
    if (selectedFileName) {
      dataChannel?.send(selectedFileName);
    }

    setIsSent(true);
  };

  const handleMessage = async (event: MessageEvent) => {
    if (typeof event.data == "string") {
      setDownloadLinkName(event.data);
    }

    if (event.data instanceof ArrayBuffer) {
      const blob = new Blob([event.data]);

      const downloadLink = URL.createObjectURL(blob);
      setDownloadLink(downloadLink);
    }
  };

  useEffect(() => {
    peerConnection?.addEventListener("icegatheringstatechange", () => {
      handleUserConnection();
    });
    dataChannel?.addEventListener("message", handleMessage);

    socketContextValue?.on("user:joined", handleUserJoined);
    socketContextValue?.on("incoming:request", handleIncomingRequest);
    socketContextValue?.on("request:accepted", handleRequestAccepted);

    return () => {
      peerConnection?.removeEventListener("icegatheringstatechange", () => {
        handleUserConnection();
      });
      dataChannel?.removeEventListener("message", handleMessage);
      socketContextValue?.off("user:joined", handleUserJoined);
      socketContextValue?.off("incoming:request", handleIncomingRequest);
      socketContextValue?.off("request:accepted", handleRequestAccepted);
    };
  }, [
    socketContextValue,
    peerConnection,
    dataChannel,
    handleUserJoined,
    handleIncomingRequest,
    handleRequestAccepted,
  ]);

  return (
    <div className="max-w-xl mx-5 sm:mx-auto p-6 mt-48 sm:mt-12 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-1">Room</h1>

      <div className="mb-4 flex flex-col items-center">
        {remoteSocketName && (
          <span className="text-lg font-semibold">{remoteSocketName}</span>
        )}
        {remoteSocketName && !isRequestPending && (
          <span className="text-gray-500"> joined</span>
        )}
        {remoteSocketId && isRequestPending && (
          <span className="text-green-500"> connected</span>
        )}
      </div>

      {remoteSocketName && !isRequestPending && (
        <div className="flex justify-center">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={handleUserConnection}
          >
            Connect
          </button>
        </div>
      )}

      {isRequestPending && (
        <div className="mt-4 flex flex-col items-center">
          <form
            onSubmit={handleSend}
            className="flex flex-col items-center w-[15rem]"
          >
            <h1 className="text-lg font-semibold mb-2">Select your file</h1>
            <div className="mb-3 flex">
              <label
                className="text-sm 
                py-1 px-1 file:px-3 border-[1px]
                font-medium
                file:bg-stone-50 text-stone-700
                hover:cursor-pointer hover:bg-blue-50
                hover:text-blue-700 mr-2"
                htmlFor="fileUpload"
              >
                <input
                  onChange={handleSelectedFile}
                  type="file"
                  className="hidden"
                  id="fileUpload"
                />
                Upload File
              </label>
              <span>{selectedFileName}</span>
              {isSent && (
                <span>
                  <CheckCheck className="w-5 ml-2 opacity-80"/>
                </span>
              )}
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
            >
              Send
            </button>
          </form>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      )}

      {downloadLink && (
        <div className="flex justify-center items-center mt-4">
          <span className="mr-2">Received File :</span>
          <a
            href={downloadLink}
            download={downloadLinkName}
            className="block text-blue-500 hover:underline"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
};

export default Room;
