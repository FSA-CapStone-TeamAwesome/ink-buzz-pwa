import React, { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from "ethers";

let provider, web3, web3Provider;

export const CryptoTest = () => {

  const startUp = async () => {
    provider = new WalletConnectProvider({
      infuraId: "6237838e24b74f8bb53f0cb090a0244d", // Required
      qrcodeModalOptions: {
        mobileLinks: [
          "rainbow",
          "metamask",
          "argent",
          "trust",
          "imtoken",
          "pillar",
        ],
      },
    });
    console.log("provider is ", provider);

    //  Enable session (triggers QR Code modal)
    await provider.enable();

    //  Create Web3
    web3 = new Web3(provider);
    //   web3Provider = new providers.Web3Provider(provider);
    web3.eth.getAccounts().then(console.log);
    console.log("wallet is ", web3.eth.accounts.wallet);

    return(web3);

  };

  const [address, setAddress] = useState("");

  const [web3, setWeb3] = useState();

  useEffect(() => {

    console.log("reaching effect on 42")

    if (!web3) {
      console.log("Out of reach")
      setWeb3(startUp());
      setAddress(provider.accounts[0])
    }

    console.log("Always in reach")
  }, [])




  return (
    <div>
      <h2>Your Address: {address}</h2>
      {!web3 ? <button
        onClick={async () => {
          startUp();
          const accounts = provider.accounts;
          console.log("accounts is ", accounts);
          setAddress(accounts[0].toLowerCase());
        }}
      >
        Connect
      </button> : ''}
      {address.length ? (
        <button
          onClick={async () => {
            console.log("address is ", address, "type is ", typeof address);
            console.log("web3 is ", web3, "web3Provider is ", web3Provider);
            const tx = await web3.eth.sendTransaction({
              from: address,
              to: "0x73dE20c61D696867a656B089762Ad52342DC365e",
              value: "100000000000000000",
            });
            console.log(tx);
          }}
        >
          Send Jacob some eth, you goon
        </button>
      ) : (
        ""
      )}
    </div>
  );
};