import { useParams } from 'react-router-dom';

export default function RoomPage() {
  const { roomId } = useParams();

  return <div className="p-6">Room Page: {roomId}</div>;
}
