import { flushPromises } from "../helpers/flush-promises"
import { ReminderData } from "../reminder/reminder"
import { TestStorage } from "../storage/test-storage"
import { createBot } from "./bot"
import {
  TestAdapter,
  TestClient,
  TestDiscordChannel,
  TestDiscordMessage
} from "./mocks"

async function createTestBot() {
  const client = new TestClient()
  const storage = new TestStorage<ReminderData>()

  const bot = createBot(new TestAdapter(client) as any, storage)
  await bot.start()

  return { client, bot, storage }
}

describe("bot", () => {
  it("saves reminders with specific prefixes", async () => {
    const { client, storage } = await createTestBot()

    const channel = new TestDiscordChannel()

    const messages = [
      "!remindme 1 minute, do the thing",
      "!remind 1 minute, do the thing",
      "!remindwhat 1 minute, do the thing" // this one should get ignored
    ]

    for (const content of messages) {
      client.sendMessage(new TestDiscordMessage(content, channel))
    }

    await flushPromises()

    expect(channel.messages).toHaveLength(2) // need to assert that these aren't error responses... somehow
    expect(await storage.findAll()).toHaveLength(2)
  })
})
