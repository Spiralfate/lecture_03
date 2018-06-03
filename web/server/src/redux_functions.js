
import { createStore } from 'redux';

var types = {
	FILL_FIELD: 'FILL_FIELD',
	RESPONSE: 'RESPONSE',
	WRITE_DB: 'WRITE_DB',
	GET_WARES: 'GET_WARES',
	UPDATE_TABLE: 'UPDATE_TABLE',
	DELETE_ROW: 'DELETE_ROW',
	ADD_TO_BASKET: 'ADD_TO_BASKET',
	TOGGLE_MODE: 'TOGGLE_MODE',
	SET_TOTAL_PRICE: 'SET_TOTAL_PRICE',
	REMOVE_FROM_BASKET: 'REMOVE_FROM_BASKET',
	UPDATE_WARES: 'UPDATE_WARES',
}

const addResponse = (state, action) => {
	return Object.assign({}, state, {response: action.response})
}

const fetchNewItem = (state, action) => {
	const fields = state.fields;
	const esc = encodeURIComponent;
	const query = Object.keys(fields)
				  .map(key => esc(key) + '=' + esc(fields[key]))
				  .join('&');
	let result;
	
	fetch('process.php?' + query)
	.then(response => response.text())
	.then(txt => result = txt);
	
	return Object.assign({}, state, {response: result})
}

const changeStoreField = (state, action) => {
	const {input, field} = action;
	const {fields} = state;
	return Object.assign({}, state, {fields: Object.assign({}, fields, {[field]: input})})
}

const setLocalWares = (state, action) => {
	return Object.assign({}, state, {wares: action.wares})
}

const updateTable = (state, action) => {
	const { wares } = state;
	const { fields } = action;
	return Object.assign({}, state, {
			wares: [...wares, fields],
			response: action.response,
		})
}

const deleteRow = (state, action) => {
	const { index, response } = action;
	let { wares } = state;
	wares = wares.slice(0, index).concat(wares.slice(index + 1))
	return Object.assign({}, state, {wares, response})
}

const addItemToBasket = (state, action) => {
	const { wares } = state;
	const { index } = action;
	let item = wares[index];
	item = Object.assign({}, item, {['added']: true});
	let new_wares = [...wares];
	new_wares[index] = item;
	return Object.assign({}, state, {wares: new_wares})
}



const toggleMode = (state, action) => {
	const { managing } = state;
	return Object.assign({}, state, {managing: !managing})
}

const setTotalPrice = (state, action) => {
	const { index, added_amount } = action;
	const { wares } = state;
	let new_wares = [...wares];
	new_wares[index]['added_amount'] = added_amount;
	new_wares[index]['total_price'] = wares[index]['price'] * 
								  wares[index]['added_amount'];
	return Object.assign({}, state, {wares: new_wares})
}

const removeFromBasket = (state, action) => {
	const { wares } = state;
	const { index } = action;
	let item = wares[index];
	item = Object.assign({}, item, {['added']: false}, {['added_amount']: 0});
	let new_wares = [...wares];
	new_wares[index] = item;
	return Object.assign({}, state, { wares: new_wares })
}

const updateAfterPurchase = (state, action) => {
	return Object.assign({}, state, {wares: action.new_wares})
}

const reducer = (state = initialStore, action) => {
	const {type} = action;
	
	switch(type) {
		case types.FILL_FIELD: 
			return changeStoreField(state, action);
		case types.RESPONSE:
			return addResponse(state, action);
		case types.WRITE_DB:
			return fetchNewItem(state, action);
		case types.GET_WARES:
			return setLocalWares(state, action);
		case types.UPDATE_TABLE:
			return updateTable(state, action);
		case types.DELETE_ROW:
			return deleteRow(state, action);
		case types.ITEM_TOGGLE_BASKET:
			return itemToggleAdded(state, action);
		case types.ADD_TO_BASKET:
			return addItemToBasket(state, action);
		case types.SET_TOTAL_PRICE:
			return setTotalPrice(state, action);
		case types.REMOVE_FROM_BASKET:
			return removeFromBasket(state, action);
		case types.TOGGLE_MODE:
			return toggleMode(state, action);
		case types.UPDATE_WARES:
			return updateAfterPurchase(state, action);
		default: return state;
	}
}

const createInitialStore = () => {
	return {
	wares: [{}],
	fields: {
		model: '',
		brand: '',
		price: '',
		amount: '',
		added: '',
		added_amount: '',
		total_price: '',
	},
	response: 'SERVER RESPONSE',
	managing: false,
	basket: [{model: 'test', brand: 'test', price: 1, amount: 5}],
	}
}

let initialStore = createInitialStore();

var store = createStore(reducer);

export default store;
export { types };
