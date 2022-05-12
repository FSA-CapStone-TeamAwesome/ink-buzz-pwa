import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import { SignIn } from './components/SignIn';
import { useAuthentication } from './hooks/useAuthentication';
import Logout from './components/Logout';
function App() {
  const { user } = useAuthentication();


  return (
    <div>
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/SignIn" element={<SignIn />} />
        <Route exact path="/Logout" element={<Logout />} />
      </Routes>
    </div>
  );
}

export default App;
