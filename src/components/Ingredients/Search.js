import React, { useEffect, useState, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';

const Search = React.memo(props => {
  const { onLoadIngredients } = props;
  const [filter, setFilter] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filter === inputRef.current.value) {
        const query = filter.length === 0 ? '' : `?orderBy="title"&equalTo="${filter}"`;
        fetch('https://react-hooks-cf90a.firebaseio.com/ingredients.json' + query)
          .then(response => {
            return response.json();
          }).then(responseData => {
            const loadedIngredients = [];
            for (const key in responseData) {
              loadedIngredients.push({
                id: key,
                title: responseData[key].title,
                amount: responseData[key].amount
              });
            }
            onLoadIngredients(loadedIngredients);
          })
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    }
  }, [filter, onLoadIngredients, inputRef]);

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input ref={inputRef} type="text" value={filter} onChange={event => setFilter(event.target.value)} />
        </div>
      </Card>
    </section>
  );
});

export default Search;
