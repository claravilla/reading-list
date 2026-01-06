import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import AddEntryForm from './pages/AddEntryForm'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/add" element={<AddEntryForm />} />
      </Routes>
    </div>
  );
}

export default App;
