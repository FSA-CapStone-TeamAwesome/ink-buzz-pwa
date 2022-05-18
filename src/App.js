import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useAuthentication } from "./hooks/useAuthentication";
import Header from "./components/Header";
import Home from "./components/Home";
import { SignIn } from "./components/SignIn";
import Logout from "./components/Logout";
import SignUp from "./components/SignUp";
import SingleNFT from "./components/SingleNFT";
import ErrorPage from "./components/ErrorPage";
import Upload from "./components/uploadFile";
import Chat from "./components/Chat";
import { getUser } from "./store/userStore";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import Profile from "./components/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

function App() {
  const { user } = useAuthentication();
  const dispatch = useDispatch();
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();

  useEffect(() => {
    user && dispatch(getUser(user));
  });

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleChainChanged = (_hexChainId) => {
        setChainId(_hexChainId);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork("");
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  const providerOptions = {
    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        appName: "Ink Buzz",
        infuraId: "6237838e24b74f8bb53f0cb090a0244d",
      },
    },
    walletconnect: {
      package: WalletConnect,
      options: {
        infuraId: "6237838e24b74f8bb53f0cb090a0244d",
      },
    },
  };

  const web3Modal = new Web3Modal({
    providerOptions, // required
  });

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) setAccount(accounts[0]);
      setChainId(network.chainId);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      <Header account={account} />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="upLoad" element={<Upload />} />
        <Route exact path="/SignIn" element={<SignIn />} />
        <Route exact path="/Logout" element={<Logout />} />
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/SignUp" element={<SignUp />} />
        <Route
          exact
          path="/Chat"
          element={
            <Chat
              provider={provider}
              setProvider={setProvider}
              library={library}
              setLibrary={setLibrary}
              account={account}
              setAccount={setAccount}
              network={network}
              setNetwork={setNetwork}
              error={error}
              setError={setError}
              chainId={chainId}
              setChainId={setChainId}
              connectWallet={connectWallet}
              web3Modal={web3Modal}
            />
          }
        />
        <Route path="/nft/:nftId" element={<SingleNFT />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default App;
