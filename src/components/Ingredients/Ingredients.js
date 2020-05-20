import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';

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

const Ingredients = () => {
  const [ingredients, ingredientsDispatch] = useReducer(ingredientReducer, []);
  const { loading, data, error, sendRequest, extra, identifier, clear } = useHttp();

  useEffect(() => {
    if (loading) return;
    switch (identifier) {
      case 'ADD_INGREDIENT':
        ingredientsDispatch({ type: 'ADD', ingredient: { id: data.name, ...extra } });
        break;
      case 'REMOVE_INGREDIENT':
        ingredientsDispatch({ type: 'DELETE', id: extra });
        break;
      default:
        break;
    }
  }, [data, extra, identifier, loading]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    ingredientsDispatch({ type: 'SET', ingredients: filteredIngredients })
  }, [])

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest('https://react-hooks-cf90a.firebaseio.com/ingredients.json', 'POST', JSON.stringify(ingredient), ingredient, 'ADD_INGREDIENT');
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(ingredientID => {
    sendRequest(`https://react-hooks-cf90a.firebaseio.com/ingredients/${ingredientID}.json`, 'DELETE', null, ingredientID, 'REMOVE_INGREDIENT');
  }, [sendRequest]);

  const ingredientList = useMemo(() => {
    return <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
  }, [ingredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear} >{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={loading} />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
