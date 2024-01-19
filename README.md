# State
Framework for state management of values

# Usage
A state contains a value, it can be subscribed to and will update its subscribers when the value is changed.\
A state can also express invalid value using the Result library.\
All states are async by default.

Create a state like so, passing a value wrapped in a result.
```javascript
let state = new State(Ok(1));
```
The state concept is devided into three contexts, Reader, Writer and Owner

### Reader
The value of the state can be 



# Changelog
* ## 0.0.13
Updated dependency
* ## 0.0.12
Added stateResource to support remote states that cannot be instantly accessed
