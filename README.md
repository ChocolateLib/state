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

# Extending State

To get full type functionality when extending a state you must do it like this, unless you know what you are doing

```typescript
class StateSpecial<R, W = R, L extends StateRelated = {}, A = W> extends State<
  R,
  W,
  L,
  A
> {}
```

You can also extend a state and used fixed types, but you must supply all the types then

```typescript
class StateSpecial extends State<number, number, {}, number> {}
```

# Specialized States

## Enum State

You can descripe an enum state with the enum state helper

```typescript
export const enum TestEnum {
  Key1 = "key1",
  Key2 = "key2",
}
const TestEnumList = {
  [TestEnum.Key1]: {
    name: "Key 1",
    icon: optional svg icon,
  },
  [TestEnum.Key2]: {
    name: "Key 2",
    description: "Optional long description",
  },
} satisfies StateEnumHelperList;

const TestEnumState = new State(
  TestEnum.Key1
  true,
  new StateEnumHelper(TestEnumList)
)
```

# Changelog

- ## 0.2.5
  Changed related default type to {} so it wouldn't be any and not check
- ## 0.2.4
  Made list on StateEnumHelper mandatory\
  Added more documentation
- ## 0.2.3
  Fixed enum helpers
- ## 0.2.2
  Fixed helpers
- ## 0.2.0
  Changed helper system around
- ## 0.1.9
  Moved to a async/sync seperate setup, as there are too many situtation where true sync is needed
- ## 0.1.8
  Changed type of setter to make i more user friendly
- ## 0.1.7
  Fixed StateEnumLimits to return value from check
- ## 0.1.6
  Fixed StateNumberRelated unit being a number
  Changed some types on state to make it more obvious that Option is used
  Changed StateDerived to support different types for each state
- ## 0.1.5
  Added enum to statelimiter
- ## 0.1.4
  Removed code from state error as it makes no sense
- ## 0.1.3
  Fixed issue when derived state has a single state connected, it would not call the subscriber when the update flag was set high
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
