

import { Provider, connect } from 'react-redux';
import React, { Component } from 'react';
import store, { types } from './redux_functions.js'

const phpUrl = 'process.php'

const Input = ({value, onChange}) => {
	//const value = fields[key];
	return (
		<input
			value={value}
			onChange={onChange}
		/>
	)
}


/*const FetchButton = ({onClick, children}) => {
	return (
		<button
			type='submit'
			onClick={e => {
				e.preventDefault();
				onClick();				
			}}
		>
		{children}
		</button>
	)
}*/

const FetchButton = ({fields, onClick, children, updateTable, updateResponse}) => {
	
	return (
		<button	
			type='submit'
			onClick={event => {
				event.preventDefault();
				sendData(fields, updateTable, updateResponse);
			}}
		>
		{children}
		</button>
	)
}

const sendData = (fields, updateTab, updateResp) => {
	const esc = encodeURIComponent;
	const query = Object.keys(fields)
				  .map(key => esc(key) + '=' + esc(fields[key]))
				  .join('&');
	
	fetch(phpUrl+ '?' + query)
	.then(response => response.text())
	.then(text => {
		if (text.toLowerCase() == 'success') {
			updateTab(fields, text);
		}
		else updateResp(text);
	})
}

const ConnectedFetchButton = connect(state => {
	return {
		fields: state.fields,
	}
},
 dispatch => {
	return {
		updateTable: (fields, response) => {
			dispatch({
				type: types.UPDATE_TABLE,
				fields,
				response,				
			})
		},
		updateResponse: response => {
			dispatch({
				type: types.RESPONSE,
				response,
			})
		},
	}
})(FetchButton);

/*
const ConnectedFetchButton = connect(null,
	dispatch => {
		return {
			onClick: () => {
				dispatch({				
					type: types.WRITE_DB,
				})
			}
		}
	}
)(FetchButton);*/

const Form = ({ fields, response, onChange }) => {
	const keys = Object.keys(fields);
	return (
		<div className='managing_form'>
			<form>
				<fieldset>
				<p>{response}</p>
				{keys.map((key, index) => {
					if (index > 3) return;
					
					return (				
						<label key={key}>
							{key.toUpperCase()}: 
							<Input 	
								value={fields[key]}
								onChange={event => {
									const value = event.target.value;
									onChange(value, key);
								}}
							/>
						</label>
					)
					}
				)}			
				<ConnectedFetchButton
				>
					Add
				</ConnectedFetchButton>
				</fieldset>
			</form>
		</div>
	)
}

const ConnectedForm = connect(
	state => {
		return {
			fields: state.fields,
			response: state.response,
		}
	},
	dispatch => {
		return {
			onChange: (input, field) => {
				dispatch({
					type: types.FILL_FIELD,
					input,
					field,
				})
			}
		}
	}
)(Form);

class Table extends Component {
		
	componentDidMount() {
		const {getWares} = this.props;
		
		fetch(phpUrl + '?getData=1')
		.then(response => response.text())
		.then(text => {
			if (text == 'FILE NOT FOUND') return;
			getWares(JSON.parse(text));			
		})
	}
	
	render() {
		const { wares, onClickDeleteRow, onClickAddToBasket, managing } = this.props;
		if (wares.length == 0) {
			return (<p>Empty list</p>)
		}
		const fields = Object.keys(wares[0]);
		const tableClass = managing ? 'table_managing' : 'table_browsing';
		return (
			<table className={['main_table', tableClass].join(' ')}>
				<tbody>
				<tr>
					<th>
						INDEX
					</th>
					{fields.map((field, index) => {
						if (index > 3) return;
						return (
						<th key={index}>{field.toUpperCase()}</th>
						)
					})}
				</tr>
				{wares.map((ware, index) => 				
					<Row 
						key={index}
						managing={managing}
						index={index}
						deleteRow={onClickDeleteRow}
						addToBasket={onClickAddToBasket}
						fields={fields}
						ware={ware}
					/>
				)}
				</tbody>
			</table>
		) 
	}
}

const Row = ({managing, index, deleteRow, addToBasket, fields, ware}) => {
	const rowClass = index % 2 == 0 ? 'even' : 'odd';
	const added = ware['added'] ? 'added' : null;
	return (
		<tr
			className={[rowClass, added].join(' ')}
			onClick={()=>{
				rowClickOperation(managing, index, deleteRow, addToBasket)}}
		>		
			<td>
				{index + 1}
			</td>
			{fields.map((field, i) => {
				if (i > 3) return;
				return (
				<td key={i}>
					{ware[field]}
				</td>
				)
			}
			)}
		</tr>
	)
}

const ConnectedTable = connect(
	state => {
		return {
			wares: state.wares,
			managing: state.managing,
		};
	},
	dispatch => {
		return {
			getWares: wares => {
				dispatch({
					type: types.GET_WARES,
					wares: wares,
				})
			},
			onClickDeleteRow: (index, response) => {
				dispatch({
					type: types.DELETE_ROW,
					index,
					response,
				})
			},
			onClickAddToBasket: (index) => {
				dispatch({
					type: types.ADD_TO_BASKET,
					index,
				})
			},
		}
	}	
)(Table);

const sendRowDeletion = (index, cb) => {
	fetch(phpUrl + '?' + `deleteIndex=${index}`)
	.then(response => response.text())
	.then(text => {
		if (text == 'DELETED')
			cb(index, text);
	})
	
}

const rowClickOperation = (isManaging, index, deleteRow, addToBasket) => {
	if (isManaging) {
		sendRowDeletion(index, deleteRow);
	}
	else {
		addToBasket(index, false);
	}
}



const BrowsingForm = ({ wares, fields, setTotalPrice, removeItem, updateLocalWares }) => {
	const keys = Object.keys(fields);
	const total = wares.reduce((total, current) => {
						const add = current['added'] ? current['total_price'] : 0;
						return total + Number(add);
					}, 0);
	return (
			<div className='browsing_form'>
				<ol>
					{wares.map((item, index) => {	
							if (!item['added']) return null;
							return (
								<li key={index}>
									<button
										onClick={() => {
											removeItem(index);
										}}
									>
										REMOVE ITEM
									</button>&nbsp;&nbsp;&nbsp;
									<b>model</b>:&nbsp;{item['model']}&nbsp;
									<b>brand</b>:&nbsp;{item['brand']}&nbsp; 									
									<b>amount</b>:&nbsp; 
								<input
									type='number'
									value={item['added_amount']}
									className='input_amount'
									onChange={event => {
										const value = event.target.value;
										setTotalPrice(index, value);
									}}
									
								/>
								<b>price</b>:&nbsp;{item['price'] * item['added_amount']}&nbsp;								
								</li>
							)
						}
					)}
					<div>
						Total: &nbsp; {total}
						{wares.some(item => (item['added_amount'] > item['amount']) 
											|| (item['added_amount'] < 0))?
					<p>You can not purchase this quantity</p> :
					<div>
						{wares.some(item => item['added']) ? 
							<button
								className='confirm_purchase_button'
								onClick={() => {
									sendWaresAfterPurchase(wares, updateLocalWares);
								}}
							>
								Confirm purchase
							</button>	:
							<p>Click on the item you would like to purchase</p>
						}
					</div>
				}
					</div>
				</ol>
				
			</div>
	)
}

const ConnectedBrowsingForm = connect(
	state => {
		return {
			wares: state.wares,
			fields: state.fields,
		}
	},
	dispatch => {
		return {
			setTotalPrice: (index, added_amount) => {
				dispatch({
					type: types.SET_TOTAL_PRICE,
					index,
					added_amount,
				})
			},
			removeItem: (index, remove) => {
				dispatch({
					type: types.REMOVE_FROM_BASKET,
					index,
				})
			},
			updateLocalWares: new_wares => {
				dispatch({
					type: types.UPDATE_WARES,
					new_wares,
				})
			},
		}
	}
)(BrowsingForm);

const sendWaresAfterPurchase = (wares, callback) => {
	let upd_wares = wares.map(item => item['added'] ? 
		Object.assign({}, item, {['amount']: item['amount'] - item['added_amount']}) :
		item)
						 .filter(item => item['amount'] != 0);
	const new_wares = JSON.stringify(upd_wares);
	
	const data = new FormData();
	data.append('new_wares', new_wares);
						 
	fetch(phpUrl, {method: 'post', body: data})
	.then(response => response.text())
	.then(text => {
		if (text == 'SUCCESSFUL UPDATE')
			callback(upd_wares);
	})
}

const ConditionalForm = ({ managing }) => {
	return (
		<div>
			{managing ?
				<ConnectedForm /> :
				<ConnectedBrowsingForm />
			}
		</div>
	)
}

const ConnectedConditionalForm = connect(
	state => {
		return {
			managing: state.managing,
		}
	}
)(ConditionalForm);

const ToggleButton = ({ managing, toggleMode }) => {
		const text = managing ? 'Managing mode' : 'Browsing mode';
	return (
		<button
			onClick={event => {
				event.preventDefault();
				toggleMode();
			}}
		>
		Current mode: {text}
		</button>
	)
}

const ConnectedToggleButton = connect(
	state => {
		return {
			managing: state.managing,
		}
	},
	dispatch => {
		return {
			toggleMode: () => {
				dispatch({
					type: types.TOGGLE_MODE,					
				})
			}
		}
	}
)(ToggleButton);

var App = () => {
	return (
		<div>
			<ConnectedToggleButton />
			<ConnectedConditionalForm />
			<ConnectedTable />
		</div>
	)
}

export default App;
