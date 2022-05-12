import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import {SignIn} from './components/SignIn';
import { useAuthentication } from "./hooks/useAuthentication";
function App() {

  const { user } = useAuthentication();

  return (
    <div>
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path='/SignIn' element={<SignIn/>} />
      </Routes>
    </div>
  );
}

export default App;
