import './App.css';
import GroupComponent from './pages/groups/group';
import Home from './pages/home/home';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

function App() {
  return (
    <Router>    
    <div className="App">
    <Routes>
    <Route path = '/' element = {<Home/>}/>
    <Route path = '/groups' element = {<GroupComponent/>}/>
    </Routes>
    </div>
    </Router>
  );
}

export default App;
