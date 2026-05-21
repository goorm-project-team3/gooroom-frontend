import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from '@/components/common/PrivateRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import RoomListPage from '@/pages/RoomListPage';
import RoomPage from '@/pages/RoomPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <RoomListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms/:roomId"
          element={
            <PrivateRoute>
              <RoomPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
