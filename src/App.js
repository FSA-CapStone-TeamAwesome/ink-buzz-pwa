import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Home from './Home';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
