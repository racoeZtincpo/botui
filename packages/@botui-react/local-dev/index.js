import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBot } from '../../botui'

import {
  BotUI,
  BotUIAction,
  BotUIMessageList
} from '../src/index.ts'

import '../src/styles/default.theme.scss'

function askNameBot(bot, type = 'select') {
  return bot
    .wait({ waitTime: 1000 })
    .then(() => bot.message.add({ text: 'hello, what is your name?' }))
    .then(() =>
      bot.action.set(
        {
          options: [
            { label: 'John', value: 'john' },
            { label: 'Jane', value: 'jane' },
          ],
        },
        { actionType: type }
      )
    )
    .then((data) =>
      bot.message.add({ text: `nice to meet you ${data.selected.label}` })
    )
}

function checkStarsBot(bot) {
  return bot
    .wait({ waitTime: 1000 })
    .then(() => bot.message.add({ text: 'hello, enter a repo' }))
    .then(() => bot.wait({ waitTime: 500 }))
    .then(() =>
      bot.action.set({ placeholder: 'repo' }, { actionType: 'input' })
    )
    .then((data) => {
      fetch(`https://api.github.com/repos/${data.value}`)
        .then((res) => res.json())
        .then((res) => {
          bot.next({ count: res.stargazers_count })
        })

      return bot.wait()
    })
    .then((data) => bot.message.add({ text: `it has ${data.count} ⭐️⭐️⭐️` }))
}

const myBot = createBot()
const MyBotUI = () => {
  return (
    <>
      <BotUIMessageList />
      <BotUIAction />
    </>
  )
}

const App = () => {
  useEffect(() => {
    askNameBot(myBot, 'selectButtons')
  }, [])

  return (
    <div>
      <BotUI bot={myBot}>
        <MyBotUI />
      </BotUI>
    </div>
  )
}

const containerElement = document.getElementById('botui')
const root = createRoot(containerElement)
root.render(<App />)
