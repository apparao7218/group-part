import './App.css';
import Footer from './pages/footer/footer';
import Header from './pages/header/header';
import Home from './pages/home/home';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    // <Router>    
    // <div className="App">
    // <Routes>
    // <Route path='/' element={<Home />} />
    // <Route path='/groups' element={<GroupComponent />} />
    // <Footer />
    // </Routes>
    // </div>
    // </Router>
    <>
      <Header />
      <div className="content">
        <Home />
      </div>
      <Footer />
    </>
  );
}

export default App;
