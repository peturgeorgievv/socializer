import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import combinedReducers from './store/reducers/combinedReducers';
import App from './components/App';
import ReduxToastr from 'react-redux-toastr';

const store = createStore(combinedReducers, applyMiddleware(thunk));

ReactDOM.render(
	<Provider store={store}>
		 <ReduxToastr
         timeOut={3000}
         newestOnTop={false}
         preventDuplicates
         position="bottom-right"
         transitionIn="fadeIn"
         transitionOut="fadeOut"
         closeOnToastrClick
		/>
		<App />
	</Provider>,
	document.getElementById('root')
);