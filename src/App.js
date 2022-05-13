import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import { SignIn } from './components/SignIn';
import Logout from './components/Logout';
import SignUp from './components/SignUp';
function App() {
  const token = window.localStorage.getItem('token');

  return (
    <div>
      <Header token={token} />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/SignIn" element={<SignIn />} />
        <Route exact path="/Logout" element={<Logout />} />
        <Route exact path="/SignUp" element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App;
