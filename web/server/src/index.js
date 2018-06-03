import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './redux_functions.js';
import App from './App.js'
import React from 'react';
import './styles.css';

ReactDOM.render(<Provider store={store}>
					<App />
				</Provider>, 
document.getElementById('root'));

