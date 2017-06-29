/*\ ECMAScript 6 Specification - How do `resolve` and `reject` work?
|*|
|*| ** This is a simplified version of ECMAScript Specification for
|*| ** the mechanism of JavaScript `Promise`. The full specification
|*| ** does much more than the following scribed.
|*|
|*| ** The following assumes NO EXCEPTION is thrown in the execution
|*|
|*| `reject(reason)`:
|*|   - if the `promise` is already settled:
|*|     - return
|*|   - let `promise` be rejected with reason
|*|   - if `promise.then` is fed with a 2nd argument being a function:
|*|     - execute this function
|*|   - else if `promise.catch` is fed with a 1st argument being a function:
|*|     - execute this function
|*|
|*| `resolve(resolution)`:
|*|   - if the `promise` is already settled:
|*|     - return
|*|   - if `resolution` is not thenable:
|*|     - let the `promise` be resolved with `value` = `resolution`
|*|   - else:
|*|     - call `resolution.then(promise.resolve, promise.reject)`
|*|     ** - if the thenable `resolution` is resolved with `value`,
|*|     **   then `promise.resolve(value)` is executed,
|*|     **   which means `promise` is also resolved with `value`.
|*|     ** - if `resolution` is rejected with `reason`,
|*|     **   then `promise.reject(reason)` is executed,
|*|     **   which means `promise` is also rejected with `reason`
|*|   - if `promise` is resolved with `value`:
|*|     - if `promise.then` is fed with a 1st argument being a function:
|*|       - execute this function
|*|   - if `promise` is rejected with `reason`:
|*|     - if `promise.then` is fed with a 2nd argument being a function:
|*|       - execute this function
|*|     - else if `promise.catch` is fed with a 1st argument being a function:
|*|       - execute this function
\*/

/*\
|*| ****************************** CAVEAT ******************************
|*| !!! RESOLVING thenables IN promise-valued actions IS PERMITTED.
|*| *************************** NEVERTHELESS ***************************
|*| !!! I AM STRONGLY AGAINST SUCH USAGE !!!
|*| !!! I AM STRONGLY AGAINST SUCH USAGE !!!
|*| !!! I AM STRONGLY AGAINST SUCH USAGE !!!
|*| *********** RECOMMENDED STYLE FOR promise-valued actions ***********
|*| !!! SIMPLY resolve normal actions OR function-valued actions INSTEAD !!!
\*/

export default function ({dispatch, getState}) {
  return (next) => {
    function _dispatch(action) {
      if (typeof action === 'function') {
        action(dispatch, getState);
        return;
      } else if (action instanceof Array) {
        return action.reduce((prev, subaction) =>
          prev ? prev.then(() => _dispatch(subaction)) : _dispatch(subaction),
          null
        );
      } else if (typeof action === 'object' && typeof action.promise === 'function') {
        // Assume `action.promise` is a function that returns a promise
        return _dispatch(action.promise());
      } else if (typeof action === 'object' && typeof action.then === 'function') {
        // The case that `action` is a thenable:
        //
        // `action` can also resolve a thenable. However,
        // `action` shouldn't reject a thenable, becase `action` won't
        // wait for this thenable being settled before it is rejected.
        //
        // if `action` resolves a thenable, `action` is then resolved
        // or rejected only after the thenable is resolved or rejected.
        // Notice that this thenable shouldn't reject a thenable
        // due to the reason stated above.
        return action.then(
          (successAction) => {
            // If `action` resolves a thenable, this thenable won't get
            // dispatched here. It will wait for this thenable being
            // finally resolved or rejected. If the thenable is resolved,
            // this resolved value will be assigned to `successAction`
            // which will be dispatched afterwards. If the thenable is
            // rejected, this callback won't even get called. In fact,
            // the rejected reason will be assigned to `failureAction`
            // below and the second callback will be called.
            return _dispatch(successAction);
          },
          (failureAction) => {
            // Forbids the rejected `failureAction` to be a thenable
            if (
              typeof failureAction === 'object' &&
              typeof failureAction.then === 'function'
            ) {
              console.warn(
                'The rejected action should not be thenable. ' +
                'This action was not dispatched...'
              );
              return failureAction;
            }
            return _dispatch(failureAction);
          }
        );
      } else {
        // `action` isn't a promise
        next(action);
        return;
      }
    }

    return (action) => {
      if (action) {
        return _dispatch(action);
      }

      // `action` is empty, let `next` dispatcher handle it
      return next();
    }
  }
}
