# State

Framework for state management of values

# Usage

A state contains a value, it can be subscribed to and will update its subscribers when the value is changed.\
A state can also express invalid value using the Result library.\
All states are async by default.

Create a state like so, passing a value wrapped in a result.

```typescript
let state = new State(Ok(1));
```

The state concept is devided into three contexts, Reader, Writer and Owner

### Reader

The reader context is four methods, subscribe, unsubscribe, async then and related.

Use the reader context by using the StateRead type on variables.

```typescript
let functionWithStateParam = (state: StateRead<number>) => {};
```

Subscribe and unsubscribe are used to add and remove a function to be updated with changes to the states value.

```typescript
let update = true;
let func = state.subscribe((value) => {
  if (value.ok) {
    //Do stuff valid value
  } else {
    //Do stuff invalid value
  }
}, update);
state.unsubscribe(func);
```

Then can be used either by using the await keyword or passing a function to the then method

```typescript
let value = await state;
if (value.ok) {
  //Do stuff valid value
} else {
  //Do stuff invalid value
}
state.then((value) => {
  if (value.ok) {
    //Do stuff valid value
  } else {
    //Do stuff invalid value
  }
});
```

Related is used to get related states to the state, a state can return other states that are relevant to the state

```typescript
//A number state as an example
let related = state.related;
if (value.ok) {
  let maxValue = await related.max;
  if (value.ok) {
    //Do stuff valid maximum value
  } else {
    //Do stuff invalid maximum value
  }
} else {
  //Do stuff invalid related
}
```

### Writer

The writer context is just a write method, it will not nessesarily change the value of the state, it just request a change of the owner.

```typescript
state.write(5);
```

### Owner

The owner context is just all the rest of the methods on the state

# Changelog

- ## 0.1.2
  Fixed issue when writing to a state, that is awaiting or have a lazy function for initial value
- ## 0.1.1
  Fixed issue with using async state with lazy function
- ## 0.1.0
  Updated to rely on result
- ## 0.0.13
  Updated dependency
- ## 0.0.12
  Added stateResource to support remote states that cannot be instantly accessed
