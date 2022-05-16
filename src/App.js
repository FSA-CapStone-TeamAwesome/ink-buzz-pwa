import './App.css';
import { Routes, Route } from 'react-router-dom';
import { CryptoTest } from './components/CryptoTest';
import { useAuthentication } from './hooks/useAuthentication';
import Header from './components/Header';
import Home from './components/Home';
import { SignIn } from './components/SignIn';
import Logout from './components/Logout';
import SignUp from './components/SignUp';
import SingleNFT from './components/SingleNFT';
import ErrorPage from './components/ErrorPage';
import { startAuth } from './config/firebase';
import Upload from './components/uploadFile';
import Chat from './components/Chat';
import Profile from './components/Profile';

function App() {
  return (
    <div>
      <Header props={startAuth} />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="upLoad" element={<Upload />} />
        <Route exact path="/SignIn" element={<SignIn />} />
        <Route exact path="/crypto" element={<CryptoTest />} />
        <Route exact path="/Logout" element={<Logout />} />
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/SignUp" element={<SignUp />} />
        <Route exact path="/Chat" element={<Chat />} />
        <Route path="/nft/:nftId" element={<SingleNFT />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
}

export default App;
