import { useReducer, useCallback } from 'react';

const initialState = {
    loading: false,
    error: null,
    data: null,
    extra: null,
    identifier: null
}

const httpReducer = (currentHttpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null, data: null, extra: null, identifier: action.identifier };
        case 'RESPONSE':
            return { ...currentHttpState, loading: false, data: action.data, extra: action.extra };
        case 'ERROR':
            return { loading: false, error: action.error };
        case 'CLEAR':
            return initialState;
        default:
            throw new Error('Should not get there!');
    }
}

const useHttp = () => {
    const [httpState, httpDispatch] = useReducer(httpReducer, initialState);
    const clear = useCallback(() => httpDispatch({ type: 'CLEAR' }), []);
    
    const sendRequest = useCallback((url, method, body, extra, identifier) => {
        httpDispatch({ type: 'SEND', identifier: identifier });
        fetch(url, {
            method: method,
            body: body,
            header: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                httpDispatch({ type: 'RESPONSE', data: data, extra: extra });
            }).catch(error => {
                httpDispatch({ type: 'ERROR', error: 'Something went wrong!' });
            });
    }, []);

    return {
        loading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest,
        extra: httpState.extra,
        identifier: httpState.identifier,
        clear: clear
    };
};

export default useHttp;