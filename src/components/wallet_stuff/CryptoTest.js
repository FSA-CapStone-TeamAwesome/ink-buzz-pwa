import React, { useState, useEffect } from "react";
import {
  VStack,
  Button,
  Text,
  HStack,
  Select,
  Input,
  Box,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { networkParams } from "./networks";
import { toHex, truncateAddress } from "./utils";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { providerOptions } from "./providerOptions";

export const CryptoTest = () => {
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();
  const [network, setNetwork] = useState();
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();

  const web3Modal = new Web3Modal({
    cacheProvider: true, // optional
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

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[toHex(network)]],
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const signMessage = async () => {
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: [message, account],
      });
      setSignedMessage(message);
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };

  const verifyMessage = async () => {
    if (!library) return;
    try {
      const verify = await library.provider.request({
        method: "personal_ecRecover",
        params: [signedMessage, signature],
      });
      setVerified(verify === account.toLowerCase());
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

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

  return (
    <>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
          >
            Let's connect with
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
            sx={{
              background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Web3Modal
          </Text>
        </HStack>
        <HStack>
          {!account ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {account ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          <Tooltip label={account} placement="right">
            <Text>{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
        </VStack>
        {account && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={switchNetwork} isDisabled={!network}>
                  Switch Network
                </Button>
                <Select placeholder="Select network" onChange={handleNetwork}>
                  <option value="3">Ropsten</option>
                  <option value="4">Rinkeby</option>
                  <option value="42">Kovan</option>
                  <option value="1666600000">Harmony</option>
                  <option value="42220">Celo</option>
                </Select>
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={signMessage} isDisabled={!message}>
                  Sign Message
                </Button>
                <Input
                  placeholder="Set Message"
                  maxLength={20}
                  onChange={handleInput}
                  w="140px"
                />
                {signature ? (
                  <Tooltip label={signature} placement="bottom">
                    <Text>{`Signature: ${truncateAddress(signature)}`}</Text>
                  </Tooltip>
                ) : null}
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={verifyMessage} isDisabled={!signature}>
                  Verify Message
                </Button>
                {verified !== undefined ? (
                  verified === true ? (
                    <VStack>
                      <CheckCircleIcon color="green" />
                      <Text>Signature Verified!</Text>
                    </VStack>
                  ) : (
                    <VStack>
                      <WarningIcon color="red" />
                      <Text>Signature Denied!</Text>
                    </VStack>
                  )
                ) : null}
              </VStack>
            </Box>
          </HStack>
        )}
        <Text>{error ? error.message : null}</Text>
      </VStack>
    </>
  );

  // let provider;

  // const startUp = async () => {
  //   provider = new WalletConnectProvider({
  //     infuraId: "6237838e24b74f8bb53f0cb090a0244d", // Required
  //     qrcodeModalOptions: {
  //       mobileLinks: [
  //         "rainbow",
  //         "metamask",
  //         "argent",
  //         "trust",
  //         "imtoken",
  //         "pillar",
  //       ],
  //     },
  //   });
  //   console.log("provider is ", provider);

  //   //  Enable session (triggers QR Code modal)
  //   await provider.enable();

  //   //  Create Web3
  //   let web3 = new Web3(provider);
  //   //   web3Provider = new providers.Web3Provider(provider);
  //   web3.eth.getAccounts().then(console.log);
  //   console.log("wallet is ", web3.eth.accounts.wallet);

  //   return web3;
  // };

  // const [address, setAddress] = useState("");

  // const [web3, setWeb3] = useState();

  // useEffect(() => {
  //   console.log("reaching effect on 42");

  //   if (!web3) {
  //     console.log("Out of reach");
  //     setWeb3(startUp());
  //     setAddress(provider.accounts[0]);
  //   }

  //   console.log("Always in reach");
  // }, []);

  // return (
  //   <div>
  //     <h2>Your Address: {address}</h2>
  //     {!web3 ? (
  //       <button
  //         onClick={async () => {
  //           startUp();
  //           const accounts = provider.accounts;
  //           console.log("accounts is ", accounts);
  //           setAddress(accounts[0].toLowerCase());
  //         }}
  //       >
  //         Connect
  //       </button>
  //     ) : (
  //       ""
  //     )}
  //     {address.length ? (
  //       <button
  //         onClick={async () => {
  //           console.log("address is ", address, "type is ", typeof address);
  //           console.log("web3 is ", web3);
  //           const tx = await web3.eth.sendTransaction({
  //             from: address,
  //             to: "0x73dE20c61D696867a656B089762Ad52342DC365e",
  //             value: "100000000000000000",
  //           });
  //           console.log(tx);
  //         }}
  //       >
  //         Send Jacob some eth, you goon
  //       </button>
  //     ) : (
  //       ""
  //     )}
  //   </div>
  // );
};

// import { useEffect, useState } from "react";
// import {
//   VStack,
//   Button,
//   Text,
//   HStack,
//   Select,
//   Input,
//   Box,
// } from "@chakra-ui/react";
// import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
// import { Tooltip } from "@chakra-ui/react";
// import { networkParams } from "./networks";
// import { toHex, truncateAddress } from "./utils";
// import { ethers } from "ethers";
// import Web3Modal from "web3modal";
// import { providerOptions } from "./providerOptions";

// const web3Modal = new Web3Modal({
//   cacheProvider: true, // optional
//   providerOptions, // required
// });

// export default function Home() {
//   const [provider, setProvider] = useState();
//   const [library, setLibrary] = useState();
//   const [account, setAccount] = useState();
//   const [signature, setSignature] = useState("");
//   const [error, setError] = useState("");
//   const [chainId, setChainId] = useState();
//   const [network, setNetwork] = useState();
//   const [message, setMessage] = useState("");
//   const [signedMessage, setSignedMessage] = useState("");
//   const [verified, setVerified] = useState();

//   const connectWallet = async () => {
//     try {
//       const provider = await web3Modal.connect();
//       const library = new ethers.providers.Web3Provider(provider);
//       const accounts = await library.listAccounts();
//       const network = await library.getNetwork();
//       setProvider(provider);
//       setLibrary(library);
//       if (accounts) setAccount(accounts[0]);
//       setChainId(network.chainId);
//     } catch (error) {
//       setError(error);
//     }
//   };

//   const handleNetwork = (e) => {
//     const id = e.target.value;
//     setNetwork(Number(id));
//   };

//   const handleInput = (e) => {
//     const msg = e.target.value;
//     setMessage(msg);
//   };

//   const switchNetwork = async () => {
//     try {
//       await library.provider.request({
//         method: "wallet_switchEthereumChain",
//         params: [{ chainId: toHex(network) }],
//       });
//     } catch (switchError) {
//       if (switchError.code === 4902) {
//         try {
//           await library.provider.request({
//             method: "wallet_addEthereumChain",
//             params: [networkParams[toHex(network)]],
//           });
//         } catch (error) {
//           setError(error);
//         }
//       }
//     }
//   };

//   const signMessage = async () => {
//     if (!library) return;
//     try {
//       const signature = await library.provider.request({
//         method: "personal_sign",
//         params: [message, account],
//       });
//       setSignedMessage(message);
//       setSignature(signature);
//     } catch (error) {
//       setError(error);
//     }
//   };

//   const verifyMessage = async () => {
//     if (!library) return;
//     try {
//       const verify = await library.provider.request({
//         method: "personal_ecRecover",
//         params: [signedMessage, signature],
//       });
//       setVerified(verify === account.toLowerCase());
//     } catch (error) {
//       setError(error);
//     }
//   };

//   const refreshState = () => {
//     setAccount();
//     setChainId();
//     setNetwork("");
//     setMessage("");
//     setSignature("");
//     setVerified(undefined);
//   };

//   const disconnect = async () => {
//     await web3Modal.clearCachedProvider();
//     refreshState();
//   };

//   useEffect(() => {
//     if (web3Modal.cachedProvider) {
//       connectWallet();
//     }
//   }, []);

//   useEffect(() => {
//     if (provider?.on) {
//       const handleAccountsChanged = (accounts) => {
//         console.log("accountsChanged", accounts);
//         if (accounts) setAccount(accounts[0]);
//       };

//       const handleChainChanged = (_hexChainId) => {
//         setChainId(_hexChainId);
//       };

//       const handleDisconnect = () => {
//         console.log("disconnect", error);
//         disconnect();
//       };

//       provider.on("accountsChanged", handleAccountsChanged);
//       provider.on("chainChanged", handleChainChanged);
//       provider.on("disconnect", handleDisconnect);

//       return () => {
//         if (provider.removeListener) {
//           provider.removeListener("accountsChanged", handleAccountsChanged);
//           provider.removeListener("chainChanged", handleChainChanged);
//           provider.removeListener("disconnect", handleDisconnect);
//         }
//       };
//     }
//   }, [provider]);

//   return (
//     <>
//       <Text position="absolute" top={0} right="15px">
//         If you're in the sandbox, first "Open in New Window" ⬆️
//       </Text>
//       <VStack justifyContent="center" alignItems="center" h="100vh">
//         <HStack marginBottom="10px">
//           <Text
//             margin="0"
//             lineHeight="1.15"
//             fontSize={["1.5em", "2em", "3em", "4em"]}
//             fontWeight="600"
//           >
//             Let's connect with
//           </Text>
//           <Text
//             margin="0"
//             lineHeight="1.15"
//             fontSize={["1.5em", "2em", "3em", "4em"]}
//             fontWeight="600"
//             sx={{
//               background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//             }}
//           >
//             Web3Modal
//           </Text>
//         </HStack>
//         <HStack>
//           {!account ? (
//             <Button onClick={connectWallet}>Connect Wallet</Button>
//           ) : (
//             <Button onClick={disconnect}>Disconnect</Button>
//           )}
//         </HStack>
//         <VStack justifyContent="center" alignItems="center" padding="10px 0">
//           <HStack>
//             <Text>{`Connection Status: `}</Text>
//             {account ? (
//               <CheckCircleIcon color="green" />
//             ) : (
//               <WarningIcon color="#cd5700" />
//             )}
//           </HStack>

//           <Tooltip label={account} placement="right">
//             <Text>{`Account: ${truncateAddress(account)}`}</Text>
//           </Tooltip>
//           <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
//         </VStack>
//         {account && (
//           <HStack justifyContent="flex-start" alignItems="flex-start">
//             <Box
//               maxW="sm"
//               borderWidth="1px"
//               borderRadius="lg"
//               overflow="hidden"
//               padding="10px"
//             >
//               <VStack>
//                 <Button onClick={switchNetwork} isDisabled={!network}>
//                   Switch Network
//                 </Button>
//                 <Select placeholder="Select network" onChange={handleNetwork}>
//                   <option value="3">Ropsten</option>
//                   <option value="4">Rinkeby</option>
//                   <option value="42">Kovan</option>
//                   <option value="1666600000">Harmony</option>
//                   <option value="42220">Celo</option>
//                 </Select>
//               </VStack>
//             </Box>
//             <Box
//               maxW="sm"
//               borderWidth="1px"
//               borderRadius="lg"
//               overflow="hidden"
//               padding="10px"
//             >
//               <VStack>
//                 <Button onClick={signMessage} isDisabled={!message}>
//                   Sign Message
//                 </Button>
//                 <Input
//                   placeholder="Set Message"
//                   maxLength={20}
//                   onChange={handleInput}
//                   w="140px"
//                 />
//                 {signature ? (
//                   <Tooltip label={signature} placement="bottom">
//                     <Text>{`Signature: ${truncateAddress(signature)}`}</Text>
//                   </Tooltip>
//                 ) : null}
//               </VStack>
//             </Box>
//             <Box
//               maxW="sm"
//               borderWidth="1px"
//               borderRadius="lg"
//               overflow="hidden"
//               padding="10px"
//             >
//               <VStack>
//                 <Button onClick={verifyMessage} isDisabled={!signature}>
//                   Verify Message
//                 </Button>
//                 {verified !== undefined ? (
//                   verified === true ? (
//                     <VStack>
//                       <CheckCircleIcon color="green" />
//                       <Text>Signature Verified!</Text>
//                     </VStack>
//                   ) : (
//                     <VStack>
//                       <WarningIcon color="red" />
//                       <Text>Signature Denied!</Text>
//                     </VStack>
//                   )
//                 ) : null}
//               </VStack>
//             </Box>
//           </HStack>
//         )}
//         <Text>{error ? error.message : null}</Text>
//       </VStack>
//     </>
//   );
// }
