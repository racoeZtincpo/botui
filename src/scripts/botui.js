
export const BOTUI_TYPES = {
  WAIT: 'wait',
  ACTION: 'action',
  MESSAGE: 'message',
}

const createBlock = (type = '', meta = {}, data = {}) => {
  return {
    type: type,
    meta: meta,
    data: data
  }
}

export const botuiControl = () => {
  const localState = {
    resolver: () => {},

    [BOTUI_TYPES.MESSAGE]: [],
    [BOTUI_TYPES.ACTION]: null
  }

  const callbacks = {
    [BOTUI_TYPES.MESSAGE]: () => {},
    [BOTUI_TYPES.ACTION]: () => {}
  }

  const doCallback = (state = '') => {
    callbacks[state](localState[state])
  }

  const doResolve = (...args) => {
    localState.resolver(...args)
  }

  const currentAction = {
    get: () => localState[BOTUI_TYPES.ACTION],
    set: (action) => {
      localState[BOTUI_TYPES.ACTION] = action
      doCallback(BOTUI_TYPES.ACTION)
    },
    clear: () => {
      localState[BOTUI_TYPES.ACTION] = null
      doCallback(BOTUI_TYPES.ACTION)
    }
  }

  const msg = {
    add: (block) => {
      const length = localState[BOTUI_TYPES.MESSAGE].push(block)
      doCallback(BOTUI_TYPES.MESSAGE)
      return length - 1
    },
    update: (index, block) => {
      localState[BOTUI_TYPES.MESSAGE][index] = block
      doCallback(BOTUI_TYPES.MESSAGE)
    },
    remove: (index) => {
      localState[BOTUI_TYPES.MESSAGE].splice(index, 1)
      doCallback(BOTUI_TYPES.MESSAGE)
    }
  }

  return {
    message: (meta = {}, data = { text: '' }) => {
      return new Promise((resolve) => {
        localState.resolver = resolve
        msg.add(createBlock(BOTUI_TYPES.MESSAGE, meta, data))
        doResolve()
      })
    },
    wait: (meta = { time: 0 }) => {
      return new Promise((resolve) => {
        localState.resolver = resolve
        currentAction.set(createBlock(BOTUI_TYPES.WAIT, meta))
        setTimeout(() => {
          currentAction.clear()
          doResolve()
        }, meta.time)
      })
    },
    action: (meta = {}, data = { text: '' }) => {
      return new Promise((resolve) => {
        const action = createBlock(BOTUI_TYPES.ACTION, meta, data)
        currentAction.set(action)

        localState.resolver = (...args) => {
          currentAction.clear()

          msg.add(createBlock(BOTUI_TYPES.MESSAGE, {
            type: BOTUI_TYPES.ACTION
          }, ...args))

          resolve(...args)
        }
      })
    },
    onChange: (state = '', cb = () => {}) => {
      callbacks[state] = cb
    },
    next: (...args) => {
      doResolve(...args)
    }
  }
}
