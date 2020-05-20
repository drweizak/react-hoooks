import React, { useReducer, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredient, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredient, action.ingredient];
    case 'DELETE':
      return currentIngredient.filter(ig => ig.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
}

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...currentHttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.error };
    case 'CLEAR':
      return { ...currentHttpState, error: null };
    default:
      throw new Error('Should not get there!');
  }
}

const Ingredients = () => {
  const [ingredients, ingredientsDispatch] = useReducer(ingredientReducer, []);
  const [httpState, httpDispatch] = useReducer(httpReducer, { loading: false, error: null })

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', ingredients);
  }, [ingredients]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    ingredientsDispatch({ type: 'SET', ingredients: filteredIngredients })
  }, [])

  const addIngredientHandler = ingredient => {
    httpDispatch({ type: 'SEND' });
    fetch('https://react-hooks-cf90a.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'content-type': 'application/json' }
    })
      .then(response => {
        return response.json();
      }).then(responseData => {
        ingredientsDispatch({
          type: 'ADD', ingredient: { id: responseData.name, ...ingredient }
        });
        httpDispatch({ type: 'RESPONSE' });
      }).catch(error => {
        httpDispatch({ type: 'ERROR', error: 'Something went wrong!' });
      });
  }

  const removeIngredientHandler = (ingredientID) => {
    httpDispatch({ type: 'SEND' });
    fetch(`https://react-hooks-cf90a.firebaseio.com/ingredients/${ingredientID}.json`, {
      method: 'DELETE',
    })
      .then(response => {
        ingredientsDispatch({
          type: 'DELETE',
          id: ingredientID
        });
        httpDispatch({ type: 'RESPONSE' });
      }).catch(error => {
        httpDispatch({ type: 'ERROR', error: 'Something went wrong!' });
      });
  }

  const clearErrorMessageHandler = () => {
    httpDispatch({ type: 'CLEAR' });
  }

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearErrorMessageHandler} >{httpState.error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading} />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
