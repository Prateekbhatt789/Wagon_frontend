import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login';
import Dashboard from './components/dashboard/dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        { <Route path='/' Component={Login} /> }
        <Route path='/dashboard' Component={Dashboard} />
      </Routes>
    </Router>
  )
}
export default App;