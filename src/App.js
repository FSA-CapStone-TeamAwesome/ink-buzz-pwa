import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import { SignIn } from './components/SignIn';
import Logout from './components/Logout';
import SignUp from './components/SignUp';
import SingleNFT from './components/SingleNFT';
import ErrorPage from './components/ErrorPage';
import Chat from './components/Chat'

import { startAuth } from './config/firebase';
function App() {
  const token = window.localStorage.getItem('token');

  return (
    <div>
      <Header props={startAuth} />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/SignIn" element={<SignIn />} />
        <Route exact path="/Logout" element={<Logout />} />
        <Route exact path="/SignUp" element={<SignUp />} />
        <Route exact path="/Chat" element={<Chat />} />
        <Route path="/nft/:nftId" element={<SingleNFT />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
}

export default App;
